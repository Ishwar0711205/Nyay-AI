import { CloseIcon, BookIcon, DocIcon, CopyIcon } from "./Icons";
import { useState } from "react";

export default function DocumentReader({ source, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!source) return null;

  const Icon = source.retrieval_source === "user_upload" ? DocIcon : BookIcon;

  function copyExcerpt() {
    navigator.clipboard.writeText(source.excerpt || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="reader-title">
      <div className="reader-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="reader-modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <span className="source-tag-id">[{source.source_id}]</span>
            <div>
              <h3 id="reader-title" style={{ margin: 0, fontSize: "1.05rem", fontWeight: "600" }}>
                {source.law_name || source.filename}
              </h3>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "2px" }}>
                <Icon size={13} />
                <span>Page {source.page}</span>
                <span>•</span>
                <span>Retrieval similarity: <strong>{typeof source.similarity === "number" ? source.similarity.toFixed(4) : "—"}</strong></span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button type="button" className="btn btn-outline" style={{ padding: "0.35rem 0.65rem", fontSize: "0.8rem" }} onClick={copyExcerpt}>
              <CopyIcon size={14} />
              <span>{copied ? "Copied" : "Copy excerpt"}</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={onClose} aria-label="Close reader" style={{ padding: "0.35rem" }}>
              <CloseIcon size={18} />
            </button>
          </div>
        </div>

        <div className="reader-modal-body">
          <div style={{ marginBottom: "0.75rem", fontSize: "0.8rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" }}>
            Retrieved Text Excerpt (Chunk)
          </div>
          <div style={{
            backgroundColor: "var(--bg-subtle)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "1.25rem",
            fontSize: "0.95rem",
            lineHeight: "1.7",
            fontFamily: "var(--font-serif)",
            color: "var(--text-primary)"
          }}>
            {source.excerpt}
          </div>

          <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.82rem" }}>
            <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem" }}>SOURCE DOCUMENT</span>
              <strong>{source.filename}</strong>
            </div>
            <div style={{ padding: "0.6rem 0.8rem", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
              <span style={{ color: "var(--text-muted)", display: "block", fontSize: "0.72rem" }}>RETRIEVAL SOURCE</span>
              <strong>{source.retrieval_source === "user_upload" ? "Private User Workspace" : "Official Maharashtra Corpus"}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
