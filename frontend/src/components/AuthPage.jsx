import { useState } from "react";
import { ScaleIcon, InfoIcon, ShieldIcon, CheckIcon, BookIcon, GlobeIcon } from "./Icons";
import { t } from "../translations";

export default function AuthPage({ onAuthenticate, language = "en", setLanguage }) {
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function switchMode() {
    setAuthMode((m) => (m === "login" ? "register" : "login"));
    setAuthError("");
  }

  async function submit(e) {
    e.preventDefault();
    setAuthError("");
    setSubmitting(true);
    try {
      await onAuthenticate(authMode, username, password);
      setPassword("");
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      {/* ── Left: Legal Visual Panel ── */}
      <div className="auth-visual-panel" aria-hidden="true">
        <div className="auth-visual-pattern" />
        <div className="auth-visual-content">
          <div className="auth-scale-icon">
            <ScaleIcon size={34} />
          </div>
          <h2>{t("auth.welcome", language)}</h2>
          <p>{t("auth.sub", language)}</p>

          <div className="auth-trust-badges">
            <div className="auth-trust-badge">
              <BookIcon size={15} />
              <span>65 Official State Statutes</span>
            </div>
            <div className="auth-trust-badge">
              <CheckIcon size={15} />
              <span>Source-Grounded Answers</span>
            </div>
            <div className="auth-trust-badge">
              <ShieldIcon size={15} />
              <span>JWT-Isolated Workspace</span>
            </div>
            <div className="auth-trust-badge">
              <GlobeIcon size={15} />
              <span>EN • मराठी • हिन्दी</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
            <select
              value={language}
              onChange={(e) => setLanguage && setLanguage(e.target.value)}
              style={{
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "0.2rem 0.5rem",
                background: "var(--surface)",
                color: "var(--text-primary)",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
              aria-label="Select language"
            >
              <option value="en">English (EN)</option>
              <option value="mr">मराठी (MR)</option>
              <option value="hi">हिंदी (HI)</option>
            </select>
          </div>

          <div className="auth-header">
            <div className="auth-logo-badge">
              <ScaleIcon size={24} />
            </div>
            <h1>
              {authMode === "login" ? t("auth.loginTab", language) : t("auth.registerTab", language)}
            </h1>
            <p>{t("app.subtitle", language)}</p>
          </div>

          <form className="auth-form" onSubmit={submit} noValidate>
            <div className="form-field">
              <label htmlFor="auth-username">{t("auth.username", language)}</label>
              <input
                id="auth-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                placeholder="advocate@nyay.ai"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="auth-password">{t("auth.password", language)}</label>
              <input
                id="auth-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                placeholder={t("auth.passwordHint", language)}
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
                required
              />
            </div>

            {authError && (
              <div className="form-error" role="alert">
                <InfoIcon size={16} />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-block"
              style={{ padding: "0.72rem", fontSize: "0.95rem", fontWeight: "600" }}
              disabled={submitting}
            >
              {submitting
                ? "..."
                : authMode === "login"
                ? t("auth.loginBtn", language)
                : t("auth.registerBtn", language)}
            </button>
          </form>

          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: "0.85rem", color: "var(--accent-primary)" }}
              onClick={switchMode}
            >
              {authMode === "login"
                ? t("auth.switchRegister", language)
                : t("auth.switchLogin", language)}
            </button>
          </div>

          <p className="auth-footer-notice">
            {t("disclaimer.text", language)}
          </p>
        </div>
      </div>
    </div>
  );
}