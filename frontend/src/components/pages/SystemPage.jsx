import { useState } from "react";
import {
  ServerIcon, CpuIcon, LayersIcon, SearchIcon, SparkIcon, DatabaseIcon,
  BookIcon, DocIcon, ShieldIcon, ScaleIcon, ArrowRightIcon, LockIcon,
} from "../Icons";
import { translations } from "../../translations";

const TABS = [
  { id: "architecture", label: "Architecture Pipeline" },
  { id: "tech-stack", label: "Technology Stack" },
  { id: "security", label: "Security & Isolation" },
];

export default function SystemPage({ language = "en" }) {
  const t = translations[language] || translations.en;
  const [activeTab, setActiveTab] = useState("architecture");

  return (
    <>
      <div className="page-head">
        <h1>{t["page.system.title"]}</h1>
        <p>{t["page.system.sub"]}</p>
      </div>

      <div style={{ display: "flex", gap: "0.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`btn ${activeTab === tab.id ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "architecture" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Dual-Corpus Storage System */}
          <section className="card">
            <h2 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Dual Vector Collection Storage</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1rem" }}>
              Nyay AI strictly segregates official state statutes from private user-uploaded documents in distinct vector collections.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem" }}>
              <div style={{ padding: "1.25rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--accent-primary)" }}><BookIcon size={20} /></span>
                  <strong style={{ fontSize: "0.95rem" }}>Official Maharashtra Legal Corpus</strong>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                  Preloaded dataset of 65 official Maharashtra Acts, Rules, Judgments, and Circulars indexed into 5,259 chunks (500-tokens each) stored in <code>database/chroma_final</code>.
                </p>
              </div>

              <div style={{ padding: "1.25rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <span style={{ color: "var(--success)" }}><DocIcon size={20} /></span>
                  <strong style={{ fontSize: "0.95rem" }}>Private User Workspaces</strong>
                </div>
                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                  Per-user isolated ChromaDB collections stored under <code>database/user_upload_chroma/&lt;workspace_id&gt;</code>, strictly protected by JWT token authentication.
                </p>
              </div>
            </div>
          </section>

          {/* 4-Agent Orchestration Flow */}
          <section className="card">
            <h2 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>4-Agent Orchestrator Pipeline</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                <SearchIcon size={18} style={{ color: "var(--accent-primary)" }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "0.88rem" }}>1. Retriever Agent</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Converts query to 384-dim dense vector using <code>all-MiniLM-L6-v2</code> and queries ChromaDB for top-5 chunks via cosine similarity.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                <CpuIcon size={18} style={{ color: "var(--accent-primary)" }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "0.88rem" }}>2. Ingestion Agent</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Extracts text using PyMuPDF, cleans artifacts, performs 500-token / 50-token overlap sentence chunking, and persists embeddings.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                <SparkIcon size={18} style={{ color: "var(--accent-primary)" }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "0.88rem" }}>3. Answer Generation Agent</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Prompts Gemini 3.6 Flash conditioned on retrieved evidence with language formatting (English / Marathi / Hindi) and mandatory [S1]...[S5] citation anchors.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)" }}>
                <ScaleIcon size={18} style={{ color: "var(--accent-primary)" }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ fontSize: "0.88rem" }}>4. Citation &amp; Confidence Agent</strong>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    Verifies citation accuracy, attaches page metadata, evaluates max similarity against the 0.70 threshold, and outputs final response packet.
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {activeTab === "tech-stack" && (
        <section className="card">
          <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Verified Technology Stack</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>FRONTEND</span>
              <h3 style={{ fontSize: "0.95rem", margin: "4px 0" }}>React 19 + Vite</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>Custom 2026 legal design system with dark mode, interactive citation anchoring, and responsive layouts.</p>
            </div>

            <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>BACKEND API</span>
              <h3 style={{ fontSize: "0.95rem", margin: "4px 0" }}>FastAPI + Python 3.10</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>Asynchronous REST endpoints, JWT HS256 auth, PBKDF2 password hashing with 120,000 iterations.</p>
            </div>

            <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>VECTOR DATABASE</span>
              <h3 style={{ fontSize: "0.95rem", margin: "4px 0" }}>ChromaDB</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>Persistent vector storage with cosine distance metric for 5,259 official chunks and per-user workspaces.</p>
            </div>

            <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>EMBEDDINGS</span>
              <h3 style={{ fontSize: "0.95rem", margin: "4px 0" }}>all-MiniLM-L6-v2</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>Sentence Transformers 384-dimensional dense semantic embeddings running locally on CPU.</p>
            </div>

            <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>GENERATIVE AI</span>
              <h3 style={{ fontSize: "0.95rem", margin: "4px 0" }}>Gemini 3.6 Flash</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>High-speed statutory reasoning with multi-language synthesis (English, मराठी, हिंदी).</p>
            </div>

            <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase" }}>TEXT EXTRACTION</span>
              <h3 style={{ fontSize: "0.95rem", margin: "4px 0" }}>PyMuPDF (fitz)</h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>Precise page-level text and metadata extraction from high-volume Indian legal PDF gazettes.</p>
            </div>
          </div>
        </section>
      )}

      {activeTab === "security" && (
        <section className="card">
          <h2 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Security, Isolation &amp; Privacy</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <ShieldIcon size={16} style={{ color: "var(--success)" }} />
                <strong style={{ fontSize: "0.9rem" }}>Private Workspace Isolation</strong>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                Every user is allocated an isolated ChromaDB workspace namespace. User uploads and queries are never mixed with or accessible to other registered users.
              </p>
            </div>

            <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <LockIcon size={16} style={{ color: "var(--success)" }} />
                <strong style={{ fontSize: "0.9rem" }}>Cryptographic Authentication</strong>
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>
                Passwords are salted and hashed using PBKDF2 HMAC SHA-256 with 120,000 rounds. Sessions are verified using signed HS256 JWT tokens.
              </p>
            </div>
          </div>
        </section>
      )}
    </>
  );
}