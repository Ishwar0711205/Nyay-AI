import { useEffect, useState } from "react";
import { ScaleIcon, LogoutIcon, MenuIcon, CloseIcon, SunIcon, MoonIcon, ShieldIcon, GlobeIcon } from "./Icons";
import { t } from "../translations";

export const NAV_ITEMS = [
  { id: "research", label: "Research" },
  { id: "documents", label: "My Documents" },
  { id: "how-it-works", label: "How It Works" },
  { id: "system", label: "System Architecture" },
  { id: "evaluation", label: "Evaluation" },
  { id: "about", label: "About" },
];

export function currentView() {
  const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  return NAV_ITEMS.some((n) => n.id === hash) ? hash : "research";
}

export default function TopNav({
  view,
  username,
  workspaceId,
  onLogout,
  theme,
  onToggleTheme,
  language = "en",
  setLanguage,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    return () => setOpen(false);
  }, [view]);

  const initials = (username || "?")
    .split(/[._\-\s@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const displayName = username?.includes("@")
    ? `Adv. ${username.split("@")[0]}`
    : username || "Advocate";

  return (
    <header className="topbar">
      <div className="brandmark">
        <a className="brandmark-link" href="#/research" aria-label="Nyay AI legal research workspace">
          <span className="brandmark-logo">
            <ScaleIcon size={20} />
          </span>
          <span className="brandmark-text">
            <span className="brandmark-name">{t("app.title", language)}</span>
            <span className="brandmark-sub">{t("app.subtitle", language)}</span>
          </span>
        </a>
      </div>

      <nav className="topnav" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={`#/${item.id}`}
            className={`nav-link${view === item.id ? " is-active" : ""}`}
            aria-current={view === item.id ? "page" : undefined}
          >
            {t(`nav.${item.id === "how-it-works" ? "howItWorks" : item.id === "system" ? "system" : item.id}`, language)}
          </a>
        ))}
      </nav>

      <div className="topbar-actions">
        {/* Language Selector */}
        <div className="nav-control-box" title={t("lang.label", language)}>
          <GlobeIcon size={14} style={{ color: "var(--accent-primary)" }} />
          <select
            value={language}
            onChange={(e) => setLanguage && setLanguage(e.target.value)}
            aria-label="Select language"
            className="nav-lang-select"
          >
            <option value="en">English (EN)</option>
            <option value="mr">मराठी (MR)</option>
            <option value="hi">हिंदी (HI)</option>
          </select>
        </div>

        {/* Dark / Light Mode Toggle */}
        <button
          type="button"
          className="theme-toggle-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <SunIcon size={16} /> : <MoonIcon size={16} />}
        </button>

        {/* Clean Advocate Profile Card */}
        <div className="user-profile-badge" title={`Advocate: ${username} | Workspace: ${workspaceId}`}>
          <span className="user-avatar" aria-hidden="true">{initials || "A"}</span>
          <div className="user-info-column">
            <span className="user-name">{displayName}</span>
            <span className="user-role-kicker">
              <ShieldIcon size={10} style={{ color: "var(--accent-primary)", marginRight: "3px" }} />
              JWT Secured
            </span>
          </div>
          <button
            className="btn-logout"
            onClick={onLogout}
            aria-label="Logout from workspace"
            title="Logout"
          >
            <LogoutIcon size={15} />
          </button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="nav-toggle"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
        </button>
      </div>

      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#/${item.id}`}
              className={`nav-link${view === item.id ? " is-active" : ""}`}
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {t(`nav.${item.id === "how-it-works" ? "howItWorks" : item.id === "system" ? "system" : item.id}`, language)}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}