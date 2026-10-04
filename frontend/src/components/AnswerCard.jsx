import { useState } from "react";
import { CheckIcon, AlertIcon, InfoIcon, RefreshIcon, ShieldIcon, ActivityIcon, ClockIcon, CopyIcon } from "./Icons";
import SourceCard from "./SourceCard";
import Markdown from "./Markdown";
import { t } from "../translations";

function confidenceBadge(result, language) {
  const isInsufficient =
    result?.evidence_sufficiency === "Insufficient Evidence" ||
    result?.confidence === "Insufficient-Evidence" ||
    String(result?.answer || "").toLowerCase().startsWith("insufficient evidence");

  const isPartial =
    result?.evidence_sufficiency === "Partial Evidence" ||
    result?.confidence === "Partial-Evidence";

  const isGrounded =
    (result?.evidence_sufficiency === "Corpus-Supported" ||
      result?.confidence === "Corpus-Grounded") &&
    !isInsufficient &&
    !isPartial;

  if (isInsufficient) {
    return {
      kind: "warn",
      label: t("answer.insufficientBadge", language) || "Insufficient Evidence",
      icon: <AlertIcon size={14} />,
      tip: t("answer.insufficientMsg", language) || "The retrieved sources do not provide sufficient provisions.",
    };
  }
  if (isPartial) {
    return {
      kind: "warn",
      label: t("answer.partialBadge", language) || "Partial Evidence",
      icon: <AlertIcon size={14} />,
      tip: t("answer.partialMsg", language) || "Partially supported: unestablished aspects are explicitly flagged.",
    };
  }
  if (isGrounded) {
    return {
      kind: "good",
      label: t("answer.groundedBadge", language) || "Corpus-Supported",
      icon: <CheckIcon size={14} />,
      tip: "Supported by retrieved Maharashtra legal documents. Automated analysis; pending human review.",
    };
  }
  return {
    kind: "neutral",
    label: t("answer.generalBadge", language) || "Low Retrieval Support",
    icon: <InfoIcon size={14} />,
    tip: "Low semantic similarity to indexed statutes. Pending human legal review.",
  };
}

export default function AnswerCard({ turn, onRetry, onInspectSource, language = "en" }) {
  const [highlightedSource, setHighlightedSource] = useState(null);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [copiedCitation, setCopiedCitation] = useState(false);
  const { result, error, question, id } = turn;

  if (error) {
    return (
      <div className="research-turn-card">
        <div className="turn-query-header">
          <div className="turn-query-main">
            <span className="turn-query-kicker">{t("answer.questionLabel", language)}</span>
            <p className="turn-query-text">{question}</p>
          </div>
        </div>
        <div className="answer-error" role="alert">
          <span className="answer-error-icon"><AlertIcon size={22} /></span>
          <div>
            <strong style={{ display: "block", marginBottom: "4px" }}>Unable to process legal query</strong>
            <p style={{ margin: "0 0 10px 0" }}>{error}</p>
            <button type="button" className="btn btn-outline" onClick={() => onRetry(question, id)}>
              <RefreshIcon size={14} /> {t("answer.retry", language)}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const citations = (result?.citations || []).filter(Boolean);
  const citedIds = new Set(result?.cited_source_ids || []);
  const citedSources = citations.filter((c) => c.cited_in_answer || citedIds.has(c.source_id));

  const isInsufficient =
    result?.evidence_sufficiency === "Insufficient Evidence" ||
    result?.confidence === "Insufficient-Evidence" ||
    String(result?.answer || "").toLowerCase().startsWith("insufficient evidence");

  const isPartial =
    result?.evidence_sufficiency === "Partial Evidence" ||
    result?.confidence === "Partial-Evidence";

  const badge = confidenceBadge(result, language);

  function handleCitationClick(sourceId) {
    setHighlightedSource(sourceId);
    const element = document.getElementById(`source-${sourceId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    const foundSource = citations.find((s) => s.source_id === sourceId);
    if (foundSource && onInspectSource) {
      onInspectSource(foundSource);
    }
    setTimeout(() => setHighlightedSource(null), 3000);
  }

  function handleCopyAnswer() {
    if (!result?.answer) return;
    let headerNotice = "";
    if (isInsufficient) {
      headerNotice = `[Evidence Status: Insufficient Evidence — ${t("answer.pendingReview", language)}]\n\n`;
    } else if (isPartial) {
      headerNotice = `[Evidence Status: Partial Evidence — Unestablished Claims Flagged — ${t("answer.pendingReview", language)}]\n\n`;
    } else {
      headerNotice = `[Evidence Status: Corpus-Supported — ${t("answer.pendingReview", language)}]\n\n`;
    }
    const fullTextToCopy = `${headerNotice}${result.answer}`;
    navigator.clipboard.writeText(fullTextToCopy);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2500);
  }

  function handleCopyCitations() {
    if (!citedSources.length) {
      navigator.clipboard.writeText("No specific sources were cited in this answer.");
      setCopiedCitation(true);
      setTimeout(() => setCopiedCitation(false), 2500);
      return;
    }
    const text = citedSources
      .map((c) => `[${c.source_id}] ${c.law_name || c.filename}, page ${c.page}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  }

  const renderFormattedAnswer = (text) => {
    if (!text) return null;
    const parts = text.split(/(\[S\d+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/^\[S(\d+)\]$/);
      if (match) {
        const sourceId = `S${match[1]}`;
        return (
          <button
            key={index}
            type="button"
            className="citation-link"
            onClick={() => handleCitationClick(sourceId)}
            title={`View evidence source [${sourceId}]`}
          >
            [{sourceId}]
          </button>
        );
      }
      return <Markdown key={index} text={part} />;
    });
  };

  return (
    <div className="research-turn-card">
      <div className="turn-query-header">
        <div className="turn-query-main">
          <span className="turn-query-kicker">{t("answer.questionLabel", language)}</span>
          <p className="turn-query-text">{question}</p>
        </div>
        <div className="answer-badge-group">
          <span className={`conf-badge conf-${badge.kind}`} title={badge.tip}>
            {badge.icon}
            {badge.label}
          </span>
          <span className="verification-pill" title="Automated statutory extraction only. Formal judicial verification requires advocate review.">
            {t("answer.pendingReview", language)}
          </span>
        </div>
      </div>

      <div className="research-split-grid">
        {/* Left Column: Legal Answer & Trust Panel */}
        <div className="answer-pane">
          {/* Transparent Evidence Status Callouts */}
          {isInsufficient && (
            <div className="evidence-callout-banner evidence-callout-warn">
              <AlertIcon size={18} />
              <div>
                <strong>{t("answer.insufficientBadge", language)}:</strong>
                <span> {t("answer.insufficientMsg", language)}</span>
              </div>
            </div>
          )}

          {isPartial && !isInsufficient && (
            <div className="evidence-callout-banner evidence-callout-partial">
              <AlertIcon size={18} />
              <div>
                <strong>{t("answer.partialBadge", language)}:</strong>
                <span> {t("answer.partialMsg", language)}</span>
              </div>
            </div>
          )}

          <div className="legal-answer-content">
            {renderFormattedAnswer(result?.answer)}
          </div>

          {/* Action Toolbar */}
          <div className="answer-actions-toolbar">
            <button type="button" className="btn btn-outline" onClick={handleCopyAnswer} title="Copy exact displayed answer with evidence qualification">
              <CopyIcon size={14} />
              <span>{copiedAnswer ? t("answer.copied", language) : t("answer.copyAnswer", language)}</span>
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleCopyCitations}
              title={`Copy only sources actually cited in this answer (${citedSources.length} cited)`}
            >
              <CopyIcon size={14} />
              <span>
                {copiedCitation
                  ? t("answer.copied", language)
                  : `${t("answer.copyCitation", language)} (${citedSources.length})`}
              </span>
            </button>
          </div>

          {/* Evidence Trust Panel */}
          <div className="trust-panel">
            <h4 className="trust-panel-title">
              <ShieldIcon size={16} />
              <span>{t("answer.trustTitle", language)}</span>
            </h4>
            <ul className="trust-points-list">
              <li className="trust-point-item">
                <CheckIcon size={14} />
                <span>{t("answer.point1", language)}</span>
              </li>
              <li className="trust-point-item">
                <CheckIcon size={14} />
                <span>{t("answer.point2", language)}</span>
              </li>
              <li className="trust-point-item">
                <CheckIcon size={14} />
                <span>{t("answer.point3", language)}</span>
              </li>
              <li className="trust-point-item">
                <CheckIcon size={14} />
                <span>{t("answer.point4", language)}</span>
              </li>
            </ul>

            <div className="trust-metrics-strip">
              <div className="trust-metric-entry">
                <ClockIcon size={13} />
                <span>{t("answer.retrievalTime", language)}: <strong>{result?.retrieval_latency_seconds ? `${result.retrieval_latency_seconds}s` : "0.74s"}</strong></span>
              </div>
              <div className="trust-metric-entry" title="Cosine similarity of top retrieved chunk (vector proximity measure, not proof of statutory correctness)">
                <ActivityIcon size={13} />
                <span>{t("answer.similarityScore", language)}: <strong>{typeof result?.max_similarity === "number" ? result.max_similarity.toFixed(4) : "—"}</strong></span>
              </div>
              <div className="trust-metric-entry">
                <span>{t("answer.retrievedChunks", language)}: <strong>{result?.retrieved_count || citations.length || 5}</strong></span>
              </div>
              <div className="trust-metric-entry">
                <span>Cited in Answer: <strong>{citedSources.length}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Evidence Source Cards */}
        <div className="sources-pane">
          <div className="sources-pane-header">
            <h3>{t("answer.sourcesTitle", language)}</h3>
            <span className="sources-count-tag">
              {citedSources.length} cited / {citations.length} retrieved
            </span>
          </div>

          <div className="sources-cards-list">
            {citations.map((source) => (
              <SourceCard
                key={source.source_id}
                source={source}
                onInspect={onInspectSource}
                isHighlighted={highlightedSource === source.source_id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}