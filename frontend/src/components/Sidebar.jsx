import { PlusIcon, UploadIcon, TrashIcon, DocIcon, ChevronRightIcon, ClockIcon, ShieldIcon } from "./Icons";
import { t } from "../translations";

export default function Sidebar({
  workspaceId,
  documents,
  docChunks,
  sessions,
  activeSessionId,
  onSelectSession,
  onFocusQuestion,
  onGoToDocuments,
  onClear,
  language = "en",
}) {
  return (
    <aside className="sidebar" aria-label="Research Workspace">
      {/* Workspace Status Panel */}
      <section className="panel">
        <div className="panel-head">
          <h2>{t("sidebar.workspace", language)}</h2>
          <span className="panel-kicker">{t("sidebar.secured", language)}</span>
        </div>
        <div className="workspace-badge-box" title={workspaceId}>
          <ShieldIcon size={14} style={{ color: "var(--accent-primary)", flexShrink: 0 }} />
          <span>{workspaceId || "isolated_workspace"}</span>
        </div>
      </section>

      {/* Recent Research History Sessions */}
      <section className="panel">
        <div className="panel-head">
          <h2>{t("sidebar.recent", language)}</h2>
          <ClockIcon size={14} style={{ color: "var(--text-muted)" }} />
        </div>
        {sessions && sessions.length > 0 ? (
          <ul className="session-history-list">
            {sessions.slice(0, 6).map((s) => (
              <li key={s.session_id}>
                <button
                  type="button"
                  className={`session-history-item ${activeSessionId === s.session_id ? "is-active" : ""}`}
                  onClick={() => onSelectSession(s.session_id)}
                  title={s.title}
                >
                  <ClockIcon size={13} className="session-history-icon" />
                  <span className="session-history-title">{s.title || "Legal query"}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="panel-empty">{t("sidebar.recent.empty", language)}</p>
        )}
      </section>

      {/* Private Documents in Workspace */}
      <section className="panel">
        <div className="panel-head">
          <h2>{t("sidebar.docs", language)}</h2>
          <a className="panel-link" href="#/documents">
            {t("sidebar.docs.manage", language)} <ChevronRightIcon size={12} />
          </a>
        </div>
        {documents && documents.length > 0 ? (
          <ul className="doc-list">
            {documents.slice(0, 4).map((d) => (
              <li key={d.document_id} className="doc-row">
                <DocIcon size={15} className="doc-row-icon" />
                <span className="doc-row-body">
                  <span className="doc-row-name" title={d.law_name || d.filename}>
                    {d.law_name || d.filename}
                  </span>
                  <span className="doc-row-meta">
                    {d.chunks || docChunks[d.document_id] ? `${d.chunks || docChunks[d.document_id]} ${t("sidebar.docs.indexed", language)}` : "Indexed"}
                  </span>
                </span>
                <span className="doc-badge">PDF</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="panel-empty">{t("sidebar.docs.empty", language)}</p>
        )}
      </section>

      {/* Workspace Quick Actions */}
      <section className="panel panel-actions">
        <button type="button" className="btn btn-outline btn-block" onClick={onFocusQuestion}>
          <PlusIcon size={15} /> {t("sidebar.action.new", language)}
        </button>
        <button type="button" className="btn btn-outline btn-block" onClick={onGoToDocuments}>
          <UploadIcon size={15} /> {t("sidebar.action.upload", language)}
        </button>
        <button type="button" className="btn btn-ghost btn-block btn-danger" onClick={onClear}>
          <TrashIcon size={15} /> {t("sidebar.action.clear", language)}
        </button>
      </section>
    </aside>
  );
}