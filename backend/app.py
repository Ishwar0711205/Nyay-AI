"""
Nyay AI - FastAPI backend
Research-paper-aligned implementation:
React -> FastAPI/JWT -> Orchestrator -> 4 Agents -> ChromaDB -> Gemini -> citations/confidence.
"""

import os, re, time, json, sqlite3, hashlib, hmac, base64, secrets, tempfile
os.environ["USE_TF"] = "0"
os.environ["USE_TORCH"] = "1"
from pathlib import Path
from typing import Literal, Optional

import numpy as np
import pymupdf
from dotenv import load_dotenv
from fastapi import FastAPI, File, HTTPException, UploadFile, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from google import genai
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings

BASE_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BASE_DIR / ".env")
load_dotenv(Path(__file__).parent / ".env")
load_dotenv()

def _resolve_dir(env_key: str, default: Path) -> Path:
    raw = os.getenv(env_key)
    if not raw:
        return default
    p = Path(raw)
    return p if p.is_absolute() else (BASE_DIR / p).resolve()

DB_DIR = _resolve_dir("CHROMA_PATH", BASE_DIR / "database" / "chroma_final")
USER_DB_DIR = _resolve_dir("USER_CHROMA_PATH", BASE_DIR / "database" / "user_upload_chroma")
AUTH_DB = _resolve_dir("AUTH_DB", BASE_DIR / "database" / "auth.sqlite3")
COLLECTION_NAME = os.getenv("CHROMA_COLLECTION", "nyay_ai_final")
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")
JWT_SECRET = os.getenv("JWT_SECRET", "")
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "24"))
TOP_K = 5
CONFIDENCE_THRESHOLD = 0.70
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
MAX_UPLOAD_MB = 25

if not DB_DIR.exists():
    raise RuntimeError(f"Official ChromaDB directory not found: {DB_DIR}. Verify CHROMA_PATH points to an existing database.")
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY is required. Copy .env.example to .env.")
if not JWT_SECRET or JWT_SECRET == "CHANGE_ME":
    raise RuntimeError("JWT_SECRET is required. Set a long random value in .env.")

USER_DB_DIR.mkdir(parents=True, exist_ok=True)
AUTH_DB.parent.mkdir(parents=True, exist_ok=True)

embeddings = HuggingFaceEmbeddings(
    model_name=EMBEDDING_MODEL,
    model_kwargs={"device": "cpu"},
    encode_kwargs={"normalize_embeddings": True},
)
official_store = Chroma(
    collection_name=COLLECTION_NAME,
    persist_directory=str(DB_DIR),
    embedding_function=embeddings,
)
if official_store._collection.count() == 0:
    raise RuntimeError(f"Official ChromaDB collection '{COLLECTION_NAME}' at {DB_DIR} is empty.")
client = genai.Client(api_key=api_key)

app = FastAPI(title="Nyay AI API", version="1.0.0")
origins = [x.strip() for x in os.getenv("CORS_ORIGINS", "*").split(",") if x.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
security = HTTPBearer(auto_error=False)


# ---------------- Authentication: JWT (HS256, stdlib) ----------------
def _b64e(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode()

def _b64d(s: str) -> bytes:
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))

def _jwt_encode(payload: dict) -> str:
    header = {"alg": "HS256", "typ": "JWT"}
    a = _b64e(json.dumps(header, separators=(",", ":")).encode())
    b = _b64e(json.dumps(payload, separators=(",", ":")).encode())
    sig = hmac.new(JWT_SECRET.encode(), f"{a}.{b}".encode(), hashlib.sha256).digest()
    return f"{a}.{b}.{_b64e(sig)}"

def _jwt_decode(token: str) -> dict:
    try:
        a, b, c = token.split(".")
        expected = hmac.new(JWT_SECRET.encode(), f"{a}.{b}".encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(_b64d(c), expected):
            raise ValueError("bad signature")
        payload = json.loads(_b64d(b))
        if int(payload.get("exp", 0)) < int(time.time()):
            raise ValueError("expired")
        return payload
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired JWT token.") from exc

def _password_hash(password: str, salt: Optional[str] = None) -> str:
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000)
    return f"{salt}${digest.hex()}"

def _password_ok(password: str, stored: str) -> bool:
    try:
        salt, digest = stored.split("$", 1)
        candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 120_000).hex()
        return hmac.compare_digest(candidate, digest)
    except Exception:
        return False

def _init_auth_db():
    with sqlite3.connect(AUTH_DB) as con:
        con.execute("""CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            workspace_id TEXT UNIQUE NOT NULL,
            created_at REAL NOT NULL
        )""")
        con.execute("""CREATE TABLE IF NOT EXISTS chat_messages(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at REAL NOT NULL
        )""")
_init_auth_db()

def current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="JWT authentication required.")
    return _jwt_decode(credentials.credentials)

def _safe_workspace(workspace_id: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]", "_", str(workspace_id))[:80] or "default"

def _workspace_for_user(user: dict, requested: Optional[str] = None) -> str:
    expected = _safe_workspace(user["workspace_id"])
    if requested and _safe_workspace(requested) != expected:
        raise HTTPException(status_code=403, detail="Workspace does not belong to the authenticated user.")
    return expected

# ---------------- Four research-paper agents ----------------
def clean_text(text: str) -> str:
    text = text.replace("\u00ad", "")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"[ \t]*\n[ \t]*", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"(?m)^\s*\d+\s*$", "", text)
    return text.strip()

def sentence_chunks(text: str, size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    text = clean_text(text)
    if not text:
        return []
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks, current, current_tokens = [], [], 0
    def count(s): return len(re.findall(r"\S+", s))
    for sentence in sentences:
        n = count(sentence)
        if current and current_tokens + n > size:
            chunks.append(" ".join(current))
            kept, kept_tokens = [], 0
            for old in reversed(current):
                kept.insert(0, old); kept_tokens += count(old)
                if kept_tokens >= overlap: break
            current, current_tokens = kept, kept_tokens
        current.append(sentence); current_tokens += n
    if current: chunks.append(" ".join(current))
    return [c.strip() for c in chunks if c.strip()]

class IngestionAgent:
    def extract_and_chunk(self, pdf_path: Path, metadata: dict):
        docs = []
        with pymupdf.open(pdf_path) as pdf:
            for page_no, page in enumerate(pdf, start=1):
                for idx, chunk in enumerate(sentence_chunks(page.get_text())):
                    md = dict(metadata)
                    md.update({"page": page_no, "page_number": page_no, "chunk_index": idx})
                    docs.append(Document(page_content=chunk, metadata=md))
        return docs

    def add_pdf(self, pdf_path: Path, store, metadata: dict):
        docs = self.extract_and_chunk(pdf_path, metadata)
        if docs:
            store.add_documents(docs)
        return len(docs)

class RetrieverAgent:
    def retrieve(self, store, question: str, source_name: str):
        docs = store.similarity_search(question, k=TOP_K)
        if not docs: return []
        q = np.asarray(embeddings.embed_query(question), dtype=float)
        qn = np.linalg.norm(q)
        scored = []
        for doc in docs:
            v = np.asarray(embeddings.embed_query(doc.page_content), dtype=float)
            denom = qn * np.linalg.norm(v)
            sim = float(np.dot(q, v) / denom) if denom else 0.0
            md = dict(doc.metadata or {})
            md.update({"similarity": sim, "retrieval_source": source_name})
            doc.metadata = md
            scored.append(doc)
        return sorted(scored, key=lambda d: d.metadata["similarity"], reverse=True)[:TOP_K]

# ---------------- Robust Gemini API Model Invocation & Fallbacks ----------------
FALLBACK_GEMINI_MODELS = [
    GEMINI_MODEL,
    "gemini-3.5-flash-lite",
    "gemini-3-flash-preview",
    "gemini-3.8-flash",
]

def _call_gemini(prompt: str):
    models_to_try = []
    for m in FALLBACK_GEMINI_MODELS:
        if m and m not in models_to_try:
            models_to_try.append(m)

    last_error = None
    for model_name in models_to_try:
        for attempt in range(2):
            try:
                response = client.models.generate_content(model=model_name, contents=prompt)
                return response, model_name
            except Exception as exc:
                last_error = exc
                err_str = str(exc)
                if any(k in err_str for k in ("404", "NOT_FOUND", "429", "RESOURCE_EXHAUSTED", "no longer available")):
                    break
                if attempt < 1:
                    time.sleep(1)

    err_msg = str(last_error or "Unknown LLM error")
    if "404" in err_msg or "NOT_FOUND" in err_msg or "no longer available" in err_msg:
        detail = f"Gemini API Model Unavailable: Configured model '{GEMINI_MODEL}' is deprecated or unsupported. {err_msg}"
    elif "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
        detail = "Gemini API Quota Exceeded (429): Rate limit or free tier quota reached for Gemini API. Please retry in a few moments."
    elif "503" in err_msg or "UNAVAILABLE" in err_msg:
        detail = "Gemini API Service Temporary High Demand (503): Google Gemini servers are experiencing temporary high traffic. Please retry."
    elif "API_KEY" in err_msg.upper() or "UNAUTHENTICATED" in err_msg.upper() or "401" in err_msg:
        detail = "Gemini API Authentication Error: Invalid or missing GEMINI_API_KEY."
    else:
        detail = f"Gemini API Error: {err_msg}"

    raise HTTPException(status_code=502, detail=detail)

class AnswerGenerationAgent:
    def generate(self, question: str, docs, language: str = "en"):
        if not docs:
            fallback = "Insufficient Evidence: The retrieved sources do not provide sufficient provisions to answer this question."
            if language == "mr":
                fallback = "अपुरा पुरावा (Insufficient Evidence) — उपलब्ध कागदपत्रांमध्ये या प्रश्नाचे उत्तर देण्यासाठी पुरेशी माहिती उपलब्ध नाही."
            elif language == "hi":
                fallback = "अपर्याप्त साक्ष्य (Insufficient Evidence) — उपलब्ध दस्तावेजों में इस प्रश्न का उत्तर देने के लिए पर्याप्त जानकारी उपलब्ध नहीं है।"
            return {"answer": fallback, "input_tokens": 0, "output_tokens": 0, "total_tokens": 0, "used_model": None}
            
        context = []
        for i, doc in enumerate(docs, 1):
            md = doc.metadata or {}
            source_title = md.get("law_name", md.get("filename", "Unknown"))
            page_info = md.get("page", md.get("page_number", "Unknown"))
            context.append(f"[S{i}] {source_title}, page {page_info}\n{doc.page_content}")

        lang_instruction = "Provide a structured, authoritative legal analysis in plain English."
        if language == "mr":
            lang_instruction = (
                "Answer in professional, clear Marathi (मराठी). "
                "Preserve original legal statute names and section designations in English or standard Marathi transliteration. "
                "Crucial: All citation markers MUST remain exactly in the format [S1], [S2], [S3], etc."
            )
        elif language == "hi":
            lang_instruction = (
                "Answer in professional, clear Hindi (हिंदी). "
                "Preserve original legal statute names and section designations in English or standard Hindi transliteration. "
                "Crucial: All citation markers MUST remain exactly in the format [S1], [S2], [S3], etc."
            )

        prompt = f"""You are Nyay AI, an expert legal research assistant specializing in Maharashtra statutes, rules, and precedents.
Your task is to analyze the retrieved legal sources and answer the user's legal question with strict factual groundedness.

LEGAL GROUNDING & STATUTORY RULES:
1. PRIMARY GROUNDING: Answer ONLY from the retrieved legal sources below. Do not import external legal provisions or assume unstated statutory schemes.
2. STATUTE SPECIFICITY: If the question specifies a particular statute (e.g., Maharashtra Police Act), answer using ONLY provisions from that statute. Completely ignore unrelated statutes (such as Shops & Establishments or Municipal Councils); do NOT cite or mention their tags (e.g. [S4], [S5]) in your answer.
3. MULTI-PART QUESTIONS & PARTIAL SUPPORT:
   If the question asks about multiple legal powers or concepts (for example: "preventive detention and regulatory powers"):
   - Address each concept explicitly.
   - For parts SUPPORTED by the retrieved text, state the findings under a clear section:
     ### Supported Statutory Provisions
     Cite each factual or statutory assertion with its exact source tag, e.g. [S1], [S3].
   - For parts NOT established or absent in the retrieved excerpts (such as statutory preventive detention mechanisms):
     Explicitly state this under a clear section:
     ### Unestablished / Insufficient Evidence in Retrieved Corpus
     Plainly explain what the retrieved documents establish versus what they do NOT establish.
     Specifically distinguish preventive regulatory measures (such as riot prevention, dispersal of unlawful assemblies, preservation of order, and curfew rules) from formal statutory "preventive detention" as a separate legal detention regime. Explicitly state that the retrieved excerpts do not establish a preventive detention mechanism under the Act.
4. CITATION SYNTAX: Every assertion must be immediately cited with its source tag, e.g., [S1], [S2]. Only cite sources that directly contain the asserted rule.
5. NO INVENTIONS: Never invent section numbers, statutory powers, or case citations. Never treat semantic similarity as proof of legal correctness.
6. ENTIRELY INSUFFICIENT EVIDENCE: If the retrieved excerpts do not contain sufficient evidence to answer ANY part of the question, state:
   "Insufficient Evidence: The retrieved sources do not provide sufficient provisions to answer this question."
   Explain concisely what is missing.
7. LANGUAGE: {lang_instruction}
8. DISCLAIMER: Always conclude with an explicit disclaimer that this is an automated statutory research summary pending human legal review.

RETRIEVED LEGAL SOURCES:
{chr(10).join(context)}

QUESTION:
{question}

STRUCTURED LEGAL ANSWER:
"""
        response, used_model = _call_gemini(prompt)
        answer = (response.text or "").strip() or "Insufficient Evidence: No response generated."
        usage = getattr(response, "usage_metadata", None)
        inp = int(getattr(usage, "prompt_token_count", 0) or 0) if usage else 0
        out = int(getattr(usage, "candidates_token_count", 0) or 0) if usage else 0
        total = int(getattr(usage, "total_token_count", 0) or (inp + out)) if usage else inp + out
        return {"answer": answer, "input_tokens": inp, "output_tokens": out, "total_tokens": total, "used_model": used_model}

class CitationConfidenceAgent:
    def assemble(self, answer_result: dict, docs, question: str = ""):
        answer = answer_result["answer"]
        cited = sorted(set(int(x) for x in re.findall(r"\[S(\d+)\]", answer)))
        valid_indices = set(range(1, len(docs) + 1))
        
        # 1. Citation Validity (Syntactic and Index Check)
        valid_citations = [x for x in cited if x in valid_indices]
        unsupported_tags = [x for x in cited if x not in valid_indices]
        citation_accuracy = len(valid_citations) / len(cited) if cited else (1.0 if not docs else 0.0)
        
        # 2. Retrieval Similarity
        max_similarity = max((float(d.metadata.get("similarity", 0.0)) for d in docs), default=0.0)
        avg_similarity = (sum(float(d.metadata.get("similarity", 0.0)) for d in docs) / len(docs)) if docs else 0.0
        
        # 3. Evidence Sufficiency & Decoupled Confidence
        answer_lower = answer.lower()
        has_insufficient_phrase = (
            "insufficient evidence" in answer_lower or
            "अपुरा पुरावा" in answer or
            "अपर्याप्त साक्ष्य" in answer or
            "unestablished" in answer_lower or
            "not establish" in answer_lower or
            "not provide provisions" in answer_lower
        )
        
        # Entirely insufficient: no citations, or answers that begin with Insufficient Evidence
        is_entirely_insufficient = (
            answer_lower.startswith("insufficient evidence") or
            answer.startswith("अपुरा पुरावा") or
            answer.startswith("अपर्याप्त साक्ष्य") or
            len(valid_citations) == 0 or
            not docs
        )
        
        # Partially supported: has valid citations for part, but explicitly marks unestablished / insufficient parts
        is_partially_supported = (
            not is_entirely_insufficient and
            len(valid_citations) > 0 and
            has_insufficient_phrase
        )
        
        if is_entirely_insufficient:
            evidence_sufficiency = "Insufficient Evidence"
            confidence = "Insufficient-Evidence"
        elif is_partially_supported:
            evidence_sufficiency = "Partial Evidence"
            confidence = "Partial-Evidence"
        elif max_similarity >= CONFIDENCE_THRESHOLD and len(valid_citations) > 0:
            evidence_sufficiency = "Corpus-Supported"
            confidence = "Corpus-Grounded"
        elif max_similarity >= 0.50:
            evidence_sufficiency = "Partial Evidence"
            confidence = "Partial-Evidence"
        else:
            evidence_sufficiency = "Low Retrieval Support"
            confidence = "Low-Support"
            
        citations = []
        cited_sources = []
        for i, doc in enumerate(docs, 1):
            md = doc.metadata or {}
            is_cited = i in valid_citations
            c_info = {
                "source_id": f"S{i}",
                "filename": md.get("filename", "Unknown"),
                "law_name": md.get("law_name", md.get("filename", "Unknown")),
                "page": md.get("page", md.get("page_number", "Unknown")),
                "document_id": md.get("document_id", ""),
                "retrieval_source": md.get("retrieval_source", "official_corpus"),
                "similarity": round(float(md.get("similarity", 0.0)), 4),
                "excerpt": doc.page_content[:650].strip(),
                "cited_in_answer": is_cited,
            }
            citations.append(c_info)
            if is_cited:
                cited_sources.append(c_info)
            
        return {
            **answer_result,
            "citations": citations,
            "cited_sources": cited_sources,
            "cited_source_ids": [f"S{x}" for x in valid_citations],
            "unsupported_citation_tags": [f"S{x}" for x in unsupported_tags],
            "citation_accuracy": round(citation_accuracy, 4),
            "max_similarity": round(max_similarity, 4),
            "avg_similarity": round(avg_similarity, 4),
            "evidence_sufficiency": evidence_sufficiency,
            "confidence": confidence,
            "verification_status": "Pending Human Legal Review",
            "classification_notice": "Retrieval similarity measures vector embedding proximity; it is not proof of legal correctness or judicial verification.",
        }

class Orchestrator:
    def __init__(self):
        self.ingestion = IngestionAgent()
        self.retriever = RetrieverAgent()
        self.answer = AnswerGenerationAgent()
        self.citation = CitationConfidenceAgent()

    def normalize_query_for_retrieval(self, question: str) -> str:
        if re.search(r"[\u0900-\u097f]", question):
            try:
                norm_prompt = (
                    f"Extract and translate the key legal concepts from this Marathi/Hindi question into concise English search terms for statute retrieval:\n\n{question}\n\nEnglish Search Query:"
                )
                res, _ = _call_gemini(norm_prompt)
                normalized = (res.text or "").strip()
                if normalized and len(normalized) >= 3:
                    return normalized
            except Exception:
                pass
        return question

    def retrieve(self, question, mode, workspace_id):
        docs = []
        if mode in ("official", "both"):
            docs += self.retriever.retrieve(official_store, question, "official_corpus")
        if mode in ("user", "both"):
            docs += self.retriever.retrieve(get_user_store(workspace_id), question, "user_upload")
        docs.sort(key=lambda d: float(d.metadata.get("similarity", 0.0)), reverse=True)
        seen, unique = set(), []
        for d in docs:
            md = d.metadata or {}
            key = (md.get("retrieval_source"), md.get("filename"), md.get("page"), md.get("chunk_index"), d.page_content[:80])
            if key not in seen:
                seen.add(key); unique.append(d)
        return unique[:TOP_K]

    def run(self, question, mode, workspace_id, language="en"):
        start = time.perf_counter()
        search_query = self.normalize_query_for_retrieval(question)
        docs = self.retrieve(search_query, mode, workspace_id)
        retrieval_end = time.perf_counter()
        answer_result = self.answer.generate(question, docs, language=language)
        final = self.citation.assemble(answer_result, docs, question=question)
        final["retrieval_latency_seconds"] = round(retrieval_end - start, 4)
        final["total_latency_seconds"] = round(time.perf_counter() - start, 4)
        final["retrieved_count"] = len(docs)
        final["language"] = language
        final["search_query_used"] = search_query if search_query != question else None
        return final

orchestrator = Orchestrator()

def get_user_store(workspace_id: str):
    safe = _safe_workspace(workspace_id)
    path = USER_DB_DIR / safe
    path.mkdir(parents=True, exist_ok=True)
    return Chroma(collection_name=f"user_{safe}", persist_directory=str(path), embedding_function=embeddings)

# ---------------- Schemas ----------------
class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)

class LoginRequest(BaseModel):
    username: str
    password: str

class QueryRequest(BaseModel):
    query: str = Field(min_length=2, max_length=5000)
    workspace_id: Optional[str] = None
    session_id: Optional[str] = None
    mode: Literal["official", "user", "both"] = "both"
    language: Literal["en", "mr", "hi"] = "en"

class AskRequest(BaseModel):
    question: str = Field(min_length=2, max_length=5000)
    workspace_id: Optional[str] = None
    mode: Literal["official", "user", "both"] = "both"
    session_id: Optional[str] = None
    language: Literal["en", "mr", "hi"] = "en"

def _save_message(user_id, session_id, role, content):
    with sqlite3.connect(AUTH_DB) as con:
        con.execute("INSERT INTO chat_messages(user_id,session_id,role,content,created_at) VALUES(?,?,?,?,?)",
                    (user_id, session_id, role, content, time.time()))

# ---------------- API ----------------
@app.get("/")
def root():
    return {
        "message": "Welcome to Nyay AI Backend API",
        "frontend_url": "http://localhost:5173",
        "health_check": "http://localhost:8000/health",
        "docs_url": "http://localhost:8000/docs",
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "architecture": "React -> FastAPI/JWT -> Orchestrator -> 4 Agents -> ChromaDB -> Gemini",
        "embedding_model": EMBEDDING_MODEL,
        "embedding_dimensions": 384,
        "chunk_size": CHUNK_SIZE,
        "chunk_overlap": CHUNK_OVERLAP,
        "top_k": TOP_K,
        "confidence_threshold": CONFIDENCE_THRESHOLD,
        "llm_model": GEMINI_MODEL,
        "official_chunks": official_store._collection.count(),
        "supported_languages": ["en", "mr", "hi"],
    }

@app.get("/diagnostics/gemini")
def diagnostic_gemini():
    api_key_configured = bool(api_key and len(api_key) > 10)
    start_t = time.perf_counter()
    try:
        res, model_used = _call_gemini("Diagnostic connectivity check. Respond with 'OK'.")
        latency_ms = round((time.perf_counter() - start_t) * 1000, 2)
        usage = getattr(res, "usage_metadata", None)
        return {
            "status": "ok",
            "api_key_configured": api_key_configured,
            "configured_model": GEMINI_MODEL,
            "used_model": model_used,
            "sdk_initialized": True,
            "latency_ms": latency_ms,
            "test_response_preview": (res.text or "").strip()[:50],
            "token_usage": {
                "prompt_tokens": getattr(usage, "prompt_token_count", None),
                "candidates_tokens": getattr(usage, "candidates_token_count", None),
                "total_tokens": getattr(usage, "total_token_count", None),
            } if usage else None,
        }
    except Exception as exc:
        latency_ms = round((time.perf_counter() - start_t) * 1000, 2)
        return {
            "status": "error",
            "api_key_configured": api_key_configured,
            "configured_model": GEMINI_MODEL,
            "sdk_initialized": True,
            "latency_ms": latency_ms,
            "error_detail": str(exc),
        }

@app.post("/auth/register")
def register(body: RegisterRequest):
    username = body.username.strip().lower()
    if not re.fullmatch(r"[a-z0-9_.@-]{3,50}", username):
        raise HTTPException(400, "Username may contain letters, numbers, dot, underscore, hyphen and @.")
    workspace = _safe_workspace(username)
    try:
        with sqlite3.connect(AUTH_DB) as con:
            cur = con.execute("INSERT INTO users(username,password_hash,workspace_id,created_at) VALUES(?,?,?,?)",
                              (username, _password_hash(body.password), workspace, time.time()))
            user_id = cur.lastrowid
    except sqlite3.IntegrityError:
        raise HTTPException(409, "Username already exists.")
    token = _jwt_encode({"sub": str(user_id), "username": username, "workspace_id": workspace,
                         "exp": int(time.time()) + JWT_EXPIRE_HOURS * 3600})
    return {"access_token": token, "token_type": "bearer", "username": username, "workspace_id": workspace}

@app.post("/auth/login")
def login(body: LoginRequest):
    username = body.username.strip().lower()
    with sqlite3.connect(AUTH_DB) as con:
        row = con.execute("SELECT id,username,password_hash,workspace_id FROM users WHERE username=?", (username,)).fetchone()
    if not row or not _password_ok(body.password, row[2]):
        raise HTTPException(401, "Invalid username or password.")
    token = _jwt_encode({"sub": str(row[0]), "username": row[1], "workspace_id": row[3],
                         "exp": int(time.time()) + JWT_EXPIRE_HOURS * 3600})
    return {"access_token": token, "token_type": "bearer", "username": row[1], "workspace_id": row[3]}

@app.get("/auth/me")
def me(user=Depends(current_user)):
    return {"username": user["username"], "workspace_id": user["workspace_id"]}

@app.post("/query")
def query(body: QueryRequest, user=Depends(current_user)):
    cleaned_query = body.query.strip()
    if not cleaned_query or len(cleaned_query) < 2:
        raise HTTPException(400, "Query cannot be empty or solely whitespace.")
    workspace = _workspace_for_user(user, body.workspace_id)
    session_id = body.session_id or secrets.token_urlsafe(16)
    _save_message(int(user["sub"]), session_id, "user", cleaned_query)
    result = orchestrator.run(cleaned_query, body.mode, workspace, language=body.language)
    _save_message(int(user["sub"]), session_id, "assistant", result["answer"])
    result["session_id"] = session_id
    result["query"] = cleaned_query
    return result

@app.post("/ask")
def ask(body: AskRequest, user=Depends(current_user)):
    cleaned_q = body.question.strip()
    if not cleaned_q or len(cleaned_q) < 2:
        raise HTTPException(400, "Question cannot be empty or solely whitespace.")
    workspace = _workspace_for_user(user, body.workspace_id)
    session_id = body.session_id or secrets.token_urlsafe(16)
    _save_message(int(user["sub"]), session_id, "user", cleaned_q)
    result = orchestrator.run(cleaned_q, body.mode, workspace, language=body.language)
    _save_message(int(user["sub"]), session_id, "assistant", result["answer"])
    result["session_id"] = session_id
    result["query"] = cleaned_q
    return result

@app.get("/sessions")
def list_sessions(user=Depends(current_user)):
    with sqlite3.connect(AUTH_DB) as con:
        rows = con.execute("""
            SELECT session_id,
                   MIN(content) as first_query,
                   MIN(created_at) as started_at,
                   MAX(created_at) as updated_at,
                   COUNT(*) as message_count
            FROM chat_messages
            WHERE user_id=? AND role='user'
            GROUP BY session_id
            ORDER BY updated_at DESC
            LIMIT 30
        """, (int(user["sub"]),)).fetchall()
    return {
        "sessions": [
            {
                "session_id": r[0],
                "title": r[1][:80] + ("..." if len(r[1]) > 80 else ""),
                "started_at": r[2],
                "updated_at": r[3],
                "query_count": r[4],
            }
            for r in rows
        ]
    }

@app.get("/sessions/{session_id}")
def session_history(session_id: str, user=Depends(current_user)):
    with sqlite3.connect(AUTH_DB) as con:
        rows = con.execute("""SELECT role,content,created_at FROM chat_messages
                              WHERE user_id=? AND session_id=? ORDER BY id""",
                           (int(user["sub"]), session_id)).fetchall()
    return {"session_id": session_id, "messages": [{"role": r, "content": c, "created_at": t} for r,c,t in rows]}

@app.post("/upload")
async def upload_pdf(workspace_id: Optional[str] = None, file: UploadFile = File(...), user=Depends(current_user)):
    workspace = _workspace_for_user(user, workspace_id)
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "Only PDF files are supported.")
    raw = await file.read()
    if len(raw) == 0:
        raise HTTPException(400, "The uploaded PDF file is empty (0 bytes).")
    if len(raw) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(413, f"PDF must be smaller than {MAX_UPLOAD_MB} MB.")
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        tmp.write(raw); tmp_path = Path(tmp.name)
    try:
        try:
            doc_test = pymupdf.open(tmp_path)
            doc_test.close()
        except Exception:
            raise HTTPException(400, "Invalid, corrupt, or unreadable PDF file.")

        store = get_user_store(workspace)
        doc_id = hashlib.sha256(raw).hexdigest()[:24]
        existing = store._collection.get(where={"document_id": doc_id}, limit=1)
        if existing and existing.get("ids"):
            return {"filename": file.filename, "chunks_added": 0, "document_id": doc_id, "duplicate": True}
        chunks = orchestrator.ingestion.add_pdf(tmp_path, store, {
            "filename": file.filename,
            "law_name": Path(file.filename).stem,
            "document_id": doc_id,
            "workspace_id": workspace,
            "retrieval_source": "user_upload",
        })
        if chunks == 0:
            raise HTTPException(400, "The PDF contains no extractable text.")
        return {"filename": file.filename, "chunks_added": chunks, "document_id": doc_id, "workspace_id": workspace}
    finally:
        try: tmp_path.unlink(missing_ok=True)
        except Exception: pass

@app.get("/documents")
def documents(user=Depends(current_user)):
    workspace = _safe_workspace(user["workspace_id"])
    store = get_user_store(workspace)
    data = store._collection.get(include=["metadatas"])
    docs = {}
    for md in data.get("metadatas", []) or []:
        if not md: continue
        did = md.get("document_id", "")
        if did not in docs:
            docs[did] = {"document_id": did, "filename": md.get("filename",""), "law_name": md.get("law_name",""), "chunks": 0}
        docs[did]["chunks"] += 1
    return {"workspace_id": workspace, "documents": list(docs.values())}

@app.delete("/documents/{document_id}")
def delete_document(document_id: str, user=Depends(current_user)):
    workspace = _safe_workspace(user["workspace_id"])
    store = get_user_store(workspace)
    try:
        store._collection.delete(where={"document_id": document_id})
        return {"status": "deleted", "document_id": document_id}
    except Exception as exc:
        raise HTTPException(500, f"Failed to delete document: {exc}")

_CORPUS_CACHE = None

def _get_corpus_data():
    global _CORPUS_CACHE
    if _CORPUS_CACHE is not None:
        return _CORPUS_CACHE

    chroma_stats = {}
    try:
        import chromadb
        client = chromadb.PersistentClient(path=str(DB_DIR))
        col = client.get_collection(COLLECTION_NAME)
        res = col.get(include=["metadatas"])
        for m in (res.get("metadatas") or []):
            fn = m.get("filename")
            if not fn:
                continue
            if fn not in chroma_stats:
                chroma_stats[fn] = {"chunks": 0, "max_page": 0}
            chroma_stats[fn]["chunks"] += 1
            p = m.get("page", 0)
            if isinstance(p, int) and p > chroma_stats[fn]["max_page"]:
                chroma_stats[fn]["max_page"] = p
    except Exception as exc:
        print(f"Warning: Failed to load Chroma stats for corpus: {exc}")

    csv_path = BASE_DIR / "dataset_info" / "dataset_inventory.csv"
    items = []
    total_chunks = sum(s["chunks"] for s in chroma_stats.values()) or 5259

    if csv_path.exists():
        import csv
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                fn = row.get("filename", "").strip()
                rel = row.get("relative_path", "")
                rel_lower = rel.lower()

                if "judgments" in rel_lower:
                    cat = "High Court Judgments"
                elif "circulars" in rel_lower or rel_lower.startswith("gr/") or "government resolutions" in rel_lower:
                    cat = "Government Resolutions & Circulars"
                elif "property" in rel_lower or "housing" in rel_lower:
                    cat = "Property & Housing Acts"
                elif "labour" in rel_lower:
                    cat = "Labour & Employment Acts"
                elif "business" in rel_lower or "national_supporting_laws" in rel_lower:
                    cat = "Business & Commercial Acts"
                elif "land_revenue" in rel_lower or "land revenue" in rel_lower:
                    cat = "Land Revenue Codes"
                elif "government" in rel_lower or "local_government" in rel_lower:
                    cat = "Administrative & Police Acts"
                else:
                    cat = "Acts & Statutes"

                clean_title = Path(fn).stem.replace("_", " ").strip()
                clean_title = re.sub(r"\s+", " ", clean_title)

                stats = chroma_stats.get(fn, {})
                size_mb = float(row.get("size_MB") or 0)
                chunks = stats.get("chunks")
                pages = stats.get("max_page")

                items.append({
                    "filename": fn,
                    "title": clean_title,
                    "category": cat,
                    "size_mb": round(size_mb, 2) if size_mb else None,
                    "chunks": chunks,
                    "pages": pages,
                    "status": "Indexed" if chunks else "Cataloged",
                })

    _CORPUS_CACHE = {
        "total_documents": len(items),
        "total_chunks": total_chunks,
        "corpus": items,
    }
    return _CORPUS_CACHE

@app.get("/corpus")
def get_official_corpus():
    return _get_corpus_data()


