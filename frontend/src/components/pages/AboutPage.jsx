import {
  ScaleIcon, TargetIcon, AlertIcon, SparkIcon, CheckIcon,
  InfoIcon, BookIcon, ShieldIcon,
} from "../Icons";
import { translations } from "../../translations";

const CAPABILITIES = [
  "Maharashtra-focused legal research spanning 65 official state acts, rules, and government resolutions",
  "Sentence-boundary-aware 500-token chunking preserving statutory context and sub-clauses",
  "Top-5 dense semantic vector retrieval via all-MiniLM-L6-v2 embeddings in ChromaDB",
  "Precise legal citations mapped directly to source PDF titles and page numbers",
  "Retrieval confidence indicators verifying answers against a 0.70 cosine similarity threshold",
  "Multilingual answer generation in English, Marathi (मराठी), and Hindi (हिंदी)",
  "Private, JWT-secured document workspace for indexing custom legal PDFs",
];

const LIMITATIONS = [
  "System answers are strictly constrained by the documents available in the indexed corpus.",
  "Retrieved evidence may occasionally be insufficient to answer highly niche or unindexed statutory clauses.",
  "Nyay AI provides retrieval-grounded legal information and is not a substitute for professional legal advice from an advocate.",
  "All statutory provisions and citations should be verified against the official Maharashtra Gazette.",
];

const FUTURE = [
  { icon: BookIcon, label: "Expanded Maharashtra Corpus", note: "Indexing the complete compendium of Maharashtra state subordinate legislations and municipal bylaws." },
  { icon: SparkIcon, label: "Marathi-Native Dense Retrieval Tuning", note: "Fine-tuning embedding models directly on Marathi-language legal gazette corpora." },
  { icon: ScaleIcon, label: "Advanced Bombay High Court Judgment Analysis", note: "Indexing precedent case law, ratio decidendi, and obiter dicta alongside statutory enactments." },
  { icon: TargetIcon, label: "Sub-Section Granular Citation Pinpointing", note: "Deep mapping to specific statutory sub-sections and proviso clauses." },
  { icon: ShieldIcon, label: "Production Security & Observability", note: "Enterprise observability, rate-limiting, and end-to-end HTTPS infrastructure." },
];

export default function AboutPage({ language = "en" }) {
  const t = translations[language] || translations.en;
  return (
    <>
      <div className="page-head">
        <h1>{t["page.about.title"]}</h1>
        <p>{t["page.about.sub"]}</p>
      </div>

      <section className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "56px",
          height: "56px",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--navy-900)",
          color: "#ffffff",
          flexShrink: 0
        }}>
          <ScaleIcon size={30} />
        </div>
        <div>
          <h2 style={{ fontSize: "1.2rem", margin: "0 0 4px 0" }}>Nyay AI Legal Intelligence</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", margin: 0 }}>
            Nyay AI bridges the gap between complex Indian state statutes and accessible legal inquiry. By coupling dense semantic retrieval with generative reasoning, it delivers source-verifiable legal information with page-level citations.
          </p>
        </div>
      </section>

      {/* Current Capabilities */}
      <section className="card">
        <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <CheckIcon size={18} style={{ color: "var(--success)" }} /> Currently Available Capabilities
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {CAPABILITIES.map((c) => (
            <li key={c} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--success)", marginTop: "2px" }}><CheckIcon size={15} /></span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* System Limitations */}
      <section className="card">
        <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <AlertIcon size={18} style={{ color: "var(--warning)" }} /> System Limitations &amp; Scope
        </h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {LIMITATIONS.map((l) => (
            <li key={l} style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem", fontSize: "0.86rem", color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--warning)", marginTop: "2px" }}><InfoIcon size={15} /></span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Future Scope */}
      <section className="card">
        <h2 style={{ fontSize: "1.15rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "6px" }}>
          <SparkIcon size={18} style={{ color: "var(--accent-primary)" }} /> Future Development Scope
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
          {FUTURE.map((f) => (
            <div key={f.label} style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <f.icon size={16} style={{ color: "var(--accent-primary)" }} />
                <strong style={{ fontSize: "0.88rem" }}>{f.label}</strong>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: 0 }}>{f.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="card" style={{ backgroundColor: "var(--bg-subtle)", border: "1px solid var(--border)" }}>
        <h2 style={{ fontSize: "0.95rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 0.5rem 0" }}>
          Legal Information Disclaimer
        </h2>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
          Nyay AI is a research tool for navigating Maharashtra legal documents. It is not an attorney and does not provide legal advice or form an attorney-client relationship. Always consult a licensed advocate for actionable legal matters.
        </p>
      </section>
    </>
  );
}