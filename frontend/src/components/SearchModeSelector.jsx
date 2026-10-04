import { BookIcon, DocIcon, LayersIcon } from "./Icons";

const MODES = [
  {
    id: "both",
    icon: LayersIcon,
    label: "Both (Combined)",
    desc: "Search official Maharashtra corpus and your private documents together.",
  },
  {
    id: "official",
    icon: BookIcon,
    label: "Official Maharashtra Corpus",
    desc: "Search verified Maharashtra statutes, judgments, circulars and government resolutions.",
  },
  {
    id: "user",
    icon: DocIcon,
    label: "My Private Documents",
    desc: "Search your uploaded PDF files in your JWT-secured workspace.",
  },
];

export default function SearchModeSelector({ mode, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem", margin: "0.5rem 0" }}>
      {MODES.map(({ id, icon: Icon, label, desc }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "0.4rem",
            padding: "0.85rem 1rem",
            backgroundColor: mode === id ? "var(--accent-subtle)" : "var(--surface)",
            border: `1px solid ${mode === id ? "var(--accent-primary)" : "var(--border)"}`,
            borderRadius: "var(--radius-md)",
            cursor: "pointer",
            textAlign: "left",
            transition: "all var(--transition-fast)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", width: "100%" }}>
            <span style={{ color: mode === id ? "var(--accent-primary)" : "var(--text-muted)" }}>
              <Icon size={16} />
            </span>
            <strong style={{ fontSize: "0.88rem", color: mode === id ? "var(--accent-primary)" : "var(--text-primary)" }}>
              {label}
            </strong>
          </div>
          <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
            {desc}
          </span>
        </button>
      ))}
    </div>
  );
}