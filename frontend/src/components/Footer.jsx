import { ScaleIcon } from "./Icons";
import { NAV_ITEMS } from "./TopNav";
import { t } from "../translations";

export default function Footer({ language = "en" }) {
  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-top">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "30px",
              height: "30px",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "var(--navy-900)",
              color: "#ffffff",
              flexShrink: 0,
            }}>
              <ScaleIcon size={16} />
            </span>
            <div>
              <strong style={{ fontSize: "0.92rem", color: "var(--text-primary)" }}>
                {t("app.title", language)}
              </strong>
              <span style={{ display: "block", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                {t("app.subtitle", language)}
              </span>
            </div>
          </div>

          <nav
            style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}
            aria-label="Footer navigation"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#/${item.id}`}
                style={{ color: "var(--text-secondary)", fontSize: "0.82rem", textDecoration: "none" }}
                onMouseOver={(e) => e.target.style.color = "var(--text-primary)"}
                onMouseOut={(e) => e.target.style.color = "var(--text-secondary)"}
              >
                {t(`nav.${item.id === "how-it-works" ? "howItWorks" : item.id}`, language)}
              </a>
            ))}
          </nav>

          <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
            © 2026 {t("footer.rights", language)}
          </span>
        </div>

        {/* Legal Disclaimer */}
        <div className="footer-disclaimer">
          <strong style={{ color: "var(--text-secondary)" }}>{t("disclaimer.title", language)}: </strong>
          {t("disclaimer.text", language)}
        </div>
      </div>
    </footer>
  );
}