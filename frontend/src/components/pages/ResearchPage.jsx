import QuestionArea from "../QuestionArea";
import LoadingPanel from "../LoadingPanel";
import AnswerCard from "../AnswerCard";
import { ScaleIcon, BookIcon, ShieldIcon, CheckIcon } from "../Icons";
import { t } from "../../translations";

export default function ResearchPage({
  inputRef,
  query,
  setQuery,
  mode,
  setMode,
  language,
  setLanguage,
  turns,
  loading,
  ask,
  pickExample,
  onInspectSource,
}) {
  const hasConversation = turns.length > 0;

  return (
    <div className="research-page-container">
      {/* ── Dignified Legal Bench Header ── */}
      <div className="legal-bench-header glass-card">
        <div className="legal-header-main">
          <div className="legal-header-kicker">
            <span className="kicker-seal">
              <ScaleIcon size={14} />
            </span>
            <span>{t("research.eyebrow", language)}</span>
          </div>
          <h1 className="legal-header-title">
            {t("research.heading", language)}
          </h1>
          <p className="legal-header-sub">
            {t("research.sub", language)}
          </p>
        </div>

        {/* Live Corpus Metrics Ticker */}
        <div className="legal-corpus-ticker" aria-label="Official Corpus Scope">
          <div className="ticker-item">
            <BookIcon size={14} className="ticker-icon" />
            <div className="ticker-text">
              <strong>65</strong>
              <span>State Statutes</span>
            </div>
          </div>
          <div className="ticker-item">
            <CheckIcon size={14} className="ticker-icon" />
            <div className="ticker-text">
              <strong>5,259</strong>
              <span>Vector Chunks</span>
            </div>
          </div>
          <div className="ticker-item">
            <ScaleIcon size={14} className="ticker-icon" />
            <div className="ticker-text">
              <strong>Top-5</strong>
              <span>Cosine Grounded</span>
            </div>
          </div>
          <div className="ticker-item">
            <ShieldIcon size={14} className="ticker-icon" />
            <div className="ticker-text">
              <strong>Strict</strong>
              <span>Citation Grounding</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search Command Deck ── */}
      <QuestionArea
        inputRef={inputRef}
        value={query}
        onChange={setQuery}
        onAsk={ask}
        disabled={loading}
        language={language}
        onLanguageChange={setLanguage}
        mode={mode}
        onModeChange={setMode}
        onPickTopic={pickExample}
      />

      {/* ── Loading Animation ── */}
      {loading && <LoadingPanel />}

      {/* ── Results Stream ── */}
      {hasConversation && (
        <div className="research-results-stream">
          {turns.map((turn) => (
            <AnswerCard
              key={turn.id}
              turn={turn}
              onRetry={ask}
              onInspectSource={onInspectSource}
              language={language}
            />
          ))}
        </div>
      )}

      {/* ── Empty State ── */}
      {!hasConversation && !loading && (
        <div className="research-empty-state glass-card">
          <div className="empty-state-icon">
            <ScaleIcon size={32} />
          </div>
          <h3>{t("research.emptyTitle", language)}</h3>
          <p>{t("research.emptySub", language)}</p>
        </div>
      )}
    </div>
  );
}