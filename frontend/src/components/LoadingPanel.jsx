import { useState, useEffect } from "react";
import { SearchIcon, LayersIcon, SparkIcon } from "./Icons";

const LOADING_STEPS = [
  { icon: SearchIcon, text: "Searching Maharashtra legal sources...", sub: "Querying ChromaDB vector database" },
  { icon: LayersIcon, text: "Finding relevant legal passages...", sub: "Evaluating cosine similarity & top-5 evidence chunks" },
  { icon: SparkIcon, text: "Preparing a source-grounded answer...", sub: "Synthesizing answer with Gemini 3.6 Flash & verifying citations" },
];

export default function LoadingPanel() {
  const [stepIdx, setStepIdx] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setStepIdx(1), 1200);
    const timer2 = setTimeout(() => setStepIdx(2), 2600);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const current = LOADING_STEPS[stepIdx];
  const Icon = current.icon;

  return (
    <div className="loading-panel" role="status" aria-live="polite">
      <div className="loading-spinner" />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }} className="loading-text-main">
          <Icon size={18} style={{ color: "var(--accent-primary)" }} />
          <span>{current.text}</span>
        </div>
        <span className="loading-text-sub">{current.sub}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem" }}>
        {LOADING_STEPS.map((s, idx) => (
          <div
            key={idx}
            style={{
              width: "28px",
              height: "4px",
              borderRadius: "2px",
              backgroundColor: idx <= stepIdx ? "var(--accent-primary)" : "var(--border)",
              transition: "background-color var(--transition-normal)",
            }}
          />
        ))}
      </div>
    </div>
  );
}