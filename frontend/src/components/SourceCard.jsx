import { BookIcon, DocIcon, EyeIcon, CheckIcon } from "./Icons";

export default function SourceCard({ source, onInspect, isHighlighted }) {
  const isUser = source.retrieval_source === "user_upload";
  const Icon = isUser ? DocIcon : BookIcon;
  const isCited = source.cited_in_answer;

  return (
    <article
      id={`source-${source.source_id}`}
      className={`source-card ${isHighlighted ? "is-highlighted" : ""}`}
      aria-label={`Source ${source.source_id}: ${source.law_name || source.filename}`}
    >
      {/* Top row: ID + Similarity */}
      <div className="source-card-top">
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span className="source-tag-id">[{source.source_id}]</span>
          {isCited ? (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              fontSize: "0.68rem",
              fontWeight: "700",
              backgroundColor: "var(--success-bg)",
              color: "var(--success)",
              border: "1px solid var(--success-border)",
              padding: "1px 6px",
              borderRadius: "var(--radius-xs)",
              letterSpacing: "0.03em"
            }}>
              <CheckIcon size={10} /> CITED IN ANSWER
            </span>
          ) : (
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              fontSize: "0.68rem",
              fontWeight: "500",
              backgroundColor: "var(--bg-subtle)",
              color: "var(--text-muted)",
              border: "1px solid var(--border)",
              padding: "1px 6px",
              borderRadius: "var(--radius-xs)",
            }}>
              Not Cited
            </span>
          )}
        </div>
        <span className="source-sim-score" title="Vector cosine similarity; does not indicate legal proof">
          Retrieval similarity: <strong>{typeof source.similarity === "number" ? source.similarity.toFixed(4) : "—"}</strong>
        </span>
      </div>

      {/* Law / Document name */}
      <div className="source-law-name">{source.law_name || source.filename}</div>

      {/* Page + Source type */}
      <div className="source-meta-row">
        <Icon size={13} />
        <span>Page {source.page}</span>
        <span>•</span>
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "3px",
          fontSize: "0.7rem",
          fontWeight: "600",
          padding: "1px 6px",
          borderRadius: "var(--radius-xs)",
          backgroundColor: isUser ? "#f3f0ff" : "var(--info-bg)",
          color: isUser ? "#6d4fb5" : "var(--info)",
          border: `1px solid ${isUser ? "#c4b5f7" : "var(--info-border)"}`,
        }}>
          {isUser ? "My Document" : "Official Corpus"}
        </span>
      </div>

      {/* Excerpt */}
      {source.excerpt && (
        <div className="source-excerpt-box">
          {source.excerpt.length > 260 ? `${source.excerpt.slice(0, 260)}…` : source.excerpt}
        </div>
      )}

      {/* Actions */}
      <div className="source-actions-row">
        <button
          type="button"
          className="btn btn-outline btn-inspect-source"
          onClick={() => onInspect(source)}
          aria-label={`View full excerpt for source ${source.source_id}`}
        >
          <EyeIcon size={12} />
          <span>View excerpt</span>
        </button>
      </div>
    </article>
  );
}