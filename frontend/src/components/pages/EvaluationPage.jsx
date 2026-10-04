import {
  SearchIcon, CpuIcon, ScaleIcon, ClockIcon, ActivityIcon,
  CheckIcon, InfoIcon, TargetIcon, SparkIcon,
} from "../Icons";
import { translations } from "../../translations";

const PAPER_METRICS = {
  questions: 30,
  retrievalSuccess: "30/30 (100%)",
  precision: "76.67%",
  recall: "100.00%",
  meanSimilarity: "0.7364",
  retrievalLatency: "0.7361 s",
  citationAccuracy: "83.33%",
  inputTokens: "2,259.87",
  outputTokens: "184.73",
  totalTokens: "2,444.60",
  answerLatency: "34.22 s",
};

const AREAS = [
  {
    icon: SearchIcon,
    title: "Retrieval Evaluation",
    description: "Evaluates whether the relevant Maharashtra statute or rule reaches top-5 cosine similarity ranking.",
    rows: [
      { label: "Precision@5", value: PAPER_METRICS.precision },
      { label: "Recall@5", value: PAPER_METRICS.recall },
      { label: "Mean Cosine Similarity", value: PAPER_METRICS.meanSimilarity },
      { label: "Retrieval Success Rate", value: PAPER_METRICS.retrievalSuccess },
    ],
  },
  {
    icon: ScaleIcon,
    title: "Citation & Evidence Reliability",
    description: "Measures whether generated [S1]...[S5] tags point to genuine retrieved statute pages without hallucination.",
    rows: [
      { label: "Citation Accuracy", value: PAPER_METRICS.citationAccuracy },
      { label: "Confidence Threshold", value: "≥ 0.70 similarity" },
      { label: "Source Grounding", value: "100% corpus-conditioned" },
    ],
  },
  {
    icon: ClockIcon,
    title: "Latency & Timing",
    description: "Per-query timing benchmarks measured across the 30-question research evaluation test set.",
    rows: [
      { label: "Mean Retrieval Latency", value: PAPER_METRICS.retrievalLatency },
      { label: "Mean Answer Generation Latency", value: PAPER_METRICS.answerLatency },
    ],
  },
  {
    icon: ActivityIcon,
    title: "LLM Token Usage",
    description: "Average prompt and candidate tokens consumed per research query in Gemini 3.6 Flash.",
    rows: [
      { label: "Mean Input Tokens", value: PAPER_METRICS.inputTokens },
      { label: "Mean Output Tokens", value: PAPER_METRICS.outputTokens },
      { label: "Mean Total Tokens", value: PAPER_METRICS.totalTokens },
    ],
  },
];

const PENDING = [
  { label: "ROUGE-1 / ROUGE-L & BLEU Scores", note: "Pending automated linguistic reference evaluation protocol." },
  { label: "Multi-Jurisdictional Human Review", note: "Awaiting legal expert review protocol." },
  { label: "Per-Query Production API Cost", note: "Pending long-term usage tracking." },
];

export default function EvaluationPage({ language = "en" }) {
  const t = translations[language] || translations.en;
  return (
    <>
      <div className="page-head">
        <h1>{t["page.eval.title"]}</h1>
        <p>{t["page.eval.sub"]}</p>
      </div>

      {/* Highlight Results */}
      <section className="card">
        <h2 style={{ fontSize: "1.15rem", marginBottom: "1rem" }}>Verified Empirical Benchmark Highlights</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", textTransform: "uppercase" }}>RETRIEVAL SUCCESS</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--accent-primary)", marginTop: "4px" }}>
              {PAPER_METRICS.retrievalSuccess}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>30/30 ground truth questions</span>
          </div>

          <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", textTransform: "uppercase" }}>PRECISION@5</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--success)", marginTop: "4px" }}>
              {PAPER_METRICS.precision}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Top-5 precision in ChromaDB</span>
          </div>

          <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", textTransform: "uppercase" }}>CITATION ACCURACY</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--accent-primary)", marginTop: "4px" }}>
              {PAPER_METRICS.citationAccuracy}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Source tag validity rate</span>
          </div>

          <div style={{ padding: "1rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "0.74rem", color: "var(--text-muted)", textTransform: "uppercase" }}>RETRIEVAL LATENCY</span>
            <div style={{ fontSize: "1.5rem", fontWeight: "700", color: "var(--text-primary)", marginTop: "4px" }}>
              {PAPER_METRICS.retrievalLatency}
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>all-MiniLM-L6-v2 vector search</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem", fontSize: "0.78rem", color: "var(--text-muted)" }}>
          <InfoIcon size={14} />
          <span>Data source: <code>evaluation/Nyay_AI_FINAL_PAPER_METRICS.txt</code> (Final paper validation run).</span>
        </div>
      </section>

      {/* Detailed Categorized Metrics Grid */}
      <div className="eval-dashboard-grid">
        {AREAS.map((area) => (
          <article className="eval-metric-card" key={area.title}>
            <div className="eval-metric-head">
              <span className="eval-metric-icon"><area.icon size={18} /></span>
              <h3>{area.title}</h3>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0 }}>{area.description}</p>
            <dl className="eval-metric-list">
              {area.rows.map((r) => (
                <div className="eval-metric-item" key={r.label}>
                  <dt>{r.label}</dt>
                  <dd>{r.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      {/* Pending Evaluations */}
      <section className="card">
        <h2 style={{ fontSize: "1.15rem", marginBottom: "0.5rem" }}>Metrics Pending Additional Review Protocols</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1rem" }}>
          In accordance with strict research integrity standards, metrics that have not undergone complete automated benchmark validation are transparently labeled as pending rather than estimated.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {PENDING.map((p) => (
            <div key={p.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 0.8rem", backgroundColor: "var(--bg-subtle)", borderRadius: "var(--radius-sm)", fontSize: "0.84rem" }}>
              <strong>{p.label}</strong>
              <span style={{ color: "var(--text-muted)", fontStyle: "italic", fontSize: "0.8rem" }}>{p.note}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}