import { SendIcon, SearchIcon, GlobeIcon, LayersIcon, ShieldIcon } from "./Icons";
import { t } from "../translations";

export const QUICK_TOPICS = [
  {
    category: "Rent Control",
    label: "Rent Control §16 (Eviction)",
    query: "What are the specific grounds for tenant eviction under Section 16 of the Maharashtra Rent Control Act, 1999?",
  },
  {
    category: "Revenue",
    label: "Land Revenue Code §20",
    query: "What are the statutory powers and duties of Revenue Officers under Section 20 of the Maharashtra Land Revenue Code, 1966?",
  },
  {
    category: "Real Estate",
    label: "RERA Promoter Rules",
    query: "What are the mandatory obligations and disclosures required from real estate promoters under MahaRERA regulations?",
  },
  {
    category: "Police & Public Order",
    label: "Maharashtra Police Act",
    query: "What are the preventive detention and regulatory powers under the Maharashtra Police Act?",
  },
  {
    category: "Stamp Duty",
    label: "Stamp Act Duty Rates",
    query: "Which commercial instruments and conveyance deeds are chargeable with stamp duty under the Maharashtra Stamp Act?",
  },
  {
    category: "Commercial",
    label: "Shops & Est. Act 2017",
    query: "What are the daily working hour limits and statutory registration rules under the Maharashtra Shops and Establishments Act, 2017?",
  },
  {
    category: "Charitable Trusts",
    label: "Public Trusts Act §20",
    query: "What are the emergency executive powers and administrative authorities under Section 20 of the Maharashtra Public Trusts Act?",
  },
  {
    category: "Administrative",
    label: "Govt Resolutions (GRs)",
    query: "What is the legal procedure for subordinate legislation and government resolution enforcement in Maharashtra?",
  },
];

export default function QuestionArea({
  inputRef,
  value,
  onChange,
  onAsk,
  disabled,
  language,
  onLanguageChange,
  mode,
  onModeChange,
  onPickTopic,
}) {
  return (
    <div className="research-input-container glass-card">
      <div className="research-input-header">
        <div className="search-mode-indicator">
          <LayersIcon size={14} style={{ color: "var(--accent-primary)" }} />
          <span>
            {mode === "both"
              ? t("research.source.both", language)
              : mode === "official"
              ? t("research.source.official", language)
              : t("research.source.private", language)}
          </span>
        </div>
        <div className="search-badge-pill">
          <ShieldIcon size={11} style={{ color: "var(--success)", marginRight: "4px" }} />
          <span>Zero Hallucination Retrieval Grounded</span>
        </div>
      </div>

      <label className="sr-only" htmlFor="legal-search-input">
        Enter legal question
      </label>

      <div className="textarea-wrapper">
        <textarea
          id="legal-search-input"
          ref={inputRef}
          className="research-textarea"
          rows={3}
          placeholder={t("research.placeholder", language)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onAsk();
            }
          }}
          disabled={disabled}
        />
      </div>

      <div className="research-controls-row">
        <div className="research-filters-group">
          {/* Answer Language Dropdown */}
          <div className="control-pill-select" title="Answer generation language">
            <GlobeIcon size={14} style={{ color: "var(--accent-primary)" }} />
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              aria-label="Select answer language"
            >
              <option value="en">English (EN)</option>
              <option value="mr">मराठी (MR)</option>
              <option value="hi">हिंदी (HI)</option>
            </select>
          </div>

          {/* Search Corpus Scope */}
          <div className="control-pill-select" title="Choose legal corpus scope">
            <LayersIcon size={14} style={{ color: "var(--accent-primary)" }} />
            <select
              value={mode}
              onChange={(e) => onModeChange(e.target.value)}
              aria-label="Select search corpus"
            >
              <option value="both">{t("research.source.both", language)}</option>
              <option value="official">{t("research.source.official", language)}</option>
              <option value="user">{t("research.source.private", language)}</option>
            </select>
          </div>
        </div>

        <div className="research-submit-group">
          <span className="research-hint">
            <SearchIcon size={12} /> {t("research.enterHint", language)}
          </span>
          <button
            type="button"
            className="btn btn-primary btn-search-command"
            onClick={() => onAsk()}
            disabled={disabled || !value.trim()}
          >
            {disabled ? (
              <>
                <span className="btn-spinner" aria-hidden="true" />
                <span>{t("research.searching", language)}</span>
              </>
            ) : (
              <>
                <SendIcon size={15} />
                <span>{t("research.searchBtn", language)}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggested Quick Research Topics */}
      <div className="quick-topics-section">
        <div className="quick-topics-header">
          <span className="quick-topics-title">{t("research.suggested", language)}</span>
          <span className="quick-topics-hint">Click any statutory precedent to research instantly</span>
        </div>
        <div className="quick-topics-grid">
          {QUICK_TOPICS.map((item) => (
            <button
              key={item.label}
              type="button"
              className="topic-chip"
              onClick={() => onPickTopic(item.query)}
              title={item.query}
            >
              <span className="topic-chip-dot" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}