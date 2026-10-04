import {
  FileTextIcon, LayersIcon, CpuIcon, SearchIcon, SparkIcon,
  ScaleIcon, ArrowRightIcon, CheckIcon, CloseIcon,
} from "../Icons";
import { translations } from "../../translations";

const STEPS = [
  {
    n: 1,
    icon: FileTextIcon,
    title: "Document Ingestion",
    blurb: "Official Maharashtra statutes and user-uploaded PDFs are processed into clean text.",
    flow: ["PDF Document", "PyMuPDF Extraction", "Text Normalization", "Metadata Attachment"],
  },
  {
    n: 2,
    icon: LayersIcon,
    title: "Sentence-Aware Chunking",
    blurb: "Text is split on sentence boundaries to preserve legal clauses and context.",
    spec: [
      "500-token chunk window",
      "50-token contextual overlap",
      "Sentence-boundary preservation",
    ],
  },
  {
    n: 3,
    icon: CpuIcon,
    title: "Dense Embeddings",
    blurb: "Each legal chunk is converted into a normalized 384-dimensional dense vector.",
    spec: [
      "Model: sentence-transformers/all-MiniLM-L6-v2",
      "Embedding Dimension: 384-dim",
      "Cosine distance indexing",
    ],
  },
  {
    n: 4,
    icon: SearchIcon,
    title: "Semantic Vector Retrieval",
    blurb: "User queries are embedded and matched against ChromaDB vector indexes.",
    flow: ["User Question", "MiniLM Embedding", "Cosine Similarity Search", "Top-5 Evidence Chunks"],
  },
  {
    n: 5,
    icon: SparkIcon,
    title: "Source-Grounded Generation",
    blurb: "Gemini 3.6 Flash synthesizes an answer strictly from the retrieved evidence chunks.",
    flow: ["Top-5 Chunks + Question", "Language Conditioning (EN / MR / HI)", "Gemini 3.6 Flash", "Grounded Response"],
  },
  {
    n: 6,
    icon: ScaleIcon,
    title: "Citation & Confidence Verification",
    blurb: "Every statement is verified against citation tags [S1]...[S5] and scored for confidence.",
    spec: [
      "Exact source mapping [S1]...[S5]",
      "Confidence threshold: 0.70 cosine similarity",
      "Insufficient evidence fallback",
    ],
  },
];

export default function HowItWorksPage({ language = "en" }) {
  const t = translations[language] || translations.en;
  return (
    <>
      <div className="page-head">
        <h1>{t["page.howItWorks.title"]}</h1>
        <p>{t["page.howItWorks.sub"]}</p>
      </div>

      <div className="how-steps-grid">
        {STEPS.map((s) => (
          <section className="how-step-card" key={s.n}>
            <div className="how-step-header">
              <span className="how-step-badge">STEP 0{s.n}</span>
              <span style={{ color: "var(--accent-primary)" }}><s.icon size={20} /></span>
            </div>
            <h2 style={{ fontSize: "1.1rem", margin: "0.25rem 0" }}>{s.title}</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: 0 }}>{s.blurb}</p>

            {s.flow && (
              <div className="how-flow-pills">
                {s.flow.map((item, i) => (
                  <div key={item} className="how-flow-pill-item">
                    <ArrowRightIcon size={12} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}

            {s.spec && (
              <ul style={{ paddingLeft: "1.2rem", margin: "0.5rem 0 0 0", fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                {s.spec.map((x) => <li key={x} style={{ marginBottom: "3px" }}>{x}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>

      <section className="card" style={{ marginTop: "0.5rem" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Why Retrieval-Augmented Generation (RAG)?</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", marginBottom: "1.25rem" }}>
          In legal research, accuracy and traceability are paramount. General language models hallucinate statutory provisions, sections, and case citations. Nyay AI guarantees evidence-grounded responses by restricting the LLM to verified legal chunks.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1.25rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <h3 style={{ fontSize: "0.95rem", color: "var(--danger)", display: "flex", alignItems: "center", gap: "6px" }}>
              <CloseIcon size={16} /> Traditional LLM Chatbot
            </h3>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.84rem", color: "var(--text-secondary)", margin: "0.75rem 0 0 0" }}>
              <li style={{ marginBottom: "6px" }}>Generates answers from unverified training weights</li>
              <li style={{ marginBottom: "6px" }}>Risk of fabricating Maharashtra statutory sections</li>
              <li style={{ marginBottom: "6px" }}>No verifiable page numbers or excerpt evidence</li>
            </ul>
          </div>

          <div style={{ padding: "1.25rem", backgroundColor: "var(--accent-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--accent-border)" }}>
            <h3 style={{ fontSize: "0.95rem", color: "var(--accent-primary)", display: "flex", alignItems: "center", gap: "6px" }}>
              <CheckIcon size={16} /> Nyay AI Evidence RAG Pipeline
            </h3>
            <ul style={{ paddingLeft: "1.2rem", fontSize: "0.84rem", color: "var(--text-primary)", margin: "0.75rem 0 0 0" }}>
              <li style={{ marginBottom: "6px" }}>Top-5 semantic retrieval from indexed Maharashtra corpus</li>
              <li style={{ marginBottom: "6px" }}>Strict [S1]...[S5] source citations mapped to PDF pages</li>
              <li style={{ marginBottom: "6px" }}>0.70 confidence threshold with "Insufficient Evidence" safety fallback</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}