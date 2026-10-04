import { ChevronDownIcon, InfoIcon } from "./Icons";

function Row({ label, value, mono = false }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="tech-row">
      <span className="tech-label">{label}</span>
      <span className={`tech-value${mono ? " mono" : ""}`}>{value}</span>
    </div>
  );
}

export default function TechDetails({ result, error }) {
  const hasMetrics =
    result &&
    (result.retrieval_latency_seconds !== undefined ||
      result.total_latency_seconds !== undefined ||
      result.max_similarity !== undefined ||
      result.total_tokens !== undefined);

  if (!hasMetrics && !error) return null;

  const fmtLatency = (v) => (typeof v === "number" ? `${v}s` : undefined);

  return (
    <details className="tech-details">
      <summary>
        <span>Technical details</span>
        <ChevronDownIcon size={15} className="summary-chevron" />
      </summary>
      <div className="tech-body">
        {error && (
          <div className="tech-error">
            <InfoIcon size={14} />
            <span>{error}</span>
          </div>
        )}
        {result && (
          <>
            <Row label="Retrieval latency" value={fmtLatency(result.retrieval_latency_seconds)} mono />
            <Row label="Total response time" value={fmtLatency(result.total_latency_seconds)} mono />
            <Row
              label="Max similarity"
              value={typeof result.max_similarity === "number" ? result.max_similarity.toFixed(4) : undefined}
              mono
            />
            <Row label="Input tokens" value={result.input_tokens} />
            <Row label="Output tokens" value={result.output_tokens} />
            <Row label="Total tokens" value={result.total_tokens} />
            <Row label="Retrieved sources" value={result.retrieved_count} />
            {typeof result.citation_accuracy === "number" ? (
              <Row label="Citation accuracy" value={`${(result.citation_accuracy * 100).toFixed(0)}%`} />
            ) : null}
            {result.session_id ? <Row label="Session" value={result.session_id} mono /> : null}
          </>
        )}
      </div>
    </details>
  );
}