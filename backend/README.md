# Nyay AI — FastAPI Backend

Maharashtra Legal Research Assistant Backend built with FastAPI, LangChain, ChromaDB, and Google Gemini API.

## Architecture

- **Official Corpus**: Persisted ChromaDB collection (`nyay_ai_final` with 5,259 chunks)
- **Dense Embeddings**: `sentence-transformers/all-MiniLM-L6-v2` (384 dimensions)
- **Retrieval Engine**: Top-5 cosine similarity retrieval with metadata extraction
- **LLM Grounding**: Configurable Gemini model (`gemini-3-flash-preview` default) with automated fallback queue (`gemini-3.5-flash-lite`, `gemini-flash-latest`)
- **Citation Precision**: Explicit `[S1]...[S5]` citation grounding mapped to statutory provisions
- **Decoupled Confidence**: Distinguishes semantic similarity from evidence sufficiency (`Corpus-Grounded`, `Partial-Evidence`, `Insufficient-Evidence`)
- **Isolated Workspaces**: User-uploaded PDFs chunked with PyMuPDF into separate user vector collections
- **Search Modes**: `official` (statutes only), `user` (uploaded documents only), and `both` (unified deduplicated search)
- **Multilingual Support**: Fully grounded legal answers in English (`en`), Marathi (`mr`), and Hindi (`hi`)

---

## Quick Start

### 1. Environment Setup

From the repository root:

```bash
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

pip install -r backend/requirements.txt
```

### 2. Configuration

Copy `.env.example` from the root to `.env`:

```bash
cp .env.example .env
```

Ensure the following variables are defined:
- `GEMINI_API_KEY`: Your Google AI Studio API key
- `GEMINI_MODEL`: `gemini-3-flash-preview`
- `JWT_SECRET`: A long random secret key for session tokens

### 3. Running the Server

Run from the project root:

```bash
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## API Endpoints

### System & Diagnostics
- `GET /`: API entry point and status
- `GET /health`: Corpus chunk count, embedding model, and system parameters
- `GET /diagnostics/gemini`: Safe, non-leaking Gemini connectivity and token usage test
- `GET /corpus`: Inventory of official indexed Maharashtra acts and regulations

### Authentication
- `POST /auth/register`: User registration with workspace provisioning
- `POST /auth/login`: Secure login issuing JWT token
- `GET /auth/me`: Authenticated user and workspace profile

### Legal Research & RAG
- `POST /query`: Primary legal research endpoint (supports `en`, `mr`, `hi` and search modes)
- `POST /ask`: Research turn endpoint with chat history persistence
- `GET /sessions`: List chat sessions for authenticated user
- `GET /sessions/{session_id}`: Retrieve message history for a session

### Document Management
- `POST /upload`: Upload and chunk private legal PDF into user workspace
- `GET /documents`: List uploaded legal PDFs for the user
- `DELETE /documents/{document_id}`: Remove document and its chunks from user workspace

---

## Running Tests

Execute the automated unit test suite:

```bash
python -m unittest tests/test_unit_and_integration.py
```

> **Security Note**: Never expose the `GEMINI_API_KEY` or `JWT_SECRET` in frontend code or commit `.env` files to version control.
