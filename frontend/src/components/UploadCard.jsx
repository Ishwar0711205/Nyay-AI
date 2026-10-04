import { useEffect, useRef, useState } from "react";
import { UploadIcon, CheckIcon, AlertIcon, DocIcon } from "./Icons";
import { translations } from "../translations";

const PHASES = [
  "Extracting text from PDF (PyMuPDF)...",
  "Creating 500-token chunks with 50-token overlap...",
  "Generating 384-dim embeddings (all-MiniLM-L6-v2)...",
  "Indexing chunks into private ChromaDB workspace...",
];

export default function UploadCard({ file, setFile, onUpload, uploading, status, onError, language = "en" }) {
  const t = translations[language] || translations.en;
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!uploading) {
      setPhase(0);
      return;
    }
    const timer = setInterval(() => {
      setPhase((p) => Math.min(p + 1, PHASES.length - 1));
    }, 1200);
    return () => clearInterval(timer);
  }, [uploading]);

  function accept(files) {
    if (!files || !files.length) return;
    const next = files[0];
    if (!next.name.toLowerCase().endsWith(".pdf")) {
      onError("Only PDF documents are supported for legal indexing.");
      return;
    }
    setFile(next);
  }

  return (
    <section className="panel" style={{ padding: "1.5rem" }}>
      <div className="panel-head" style={{ marginBottom: "0.5rem" }}>
        <h2 style={{ fontSize: "1.15rem" }}>{t["upload.title"]}</h2>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "1.25rem" }}>
        {t["upload.desc"]}
      </p>

      <div
        className={`upload-dropzone ${dragging ? "is-dragging" : ""} ${uploading ? "is-busy" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); accept(e.dataTransfer.files); }}
        onClick={() => { if (!uploading) inputRef.current?.click(); }}
        role="button"
        tabIndex={0}
        aria-label="Upload a legal PDF. Click or drop file here."
        onKeyDown={(e) => { if (!uploading && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); inputRef.current?.click(); } }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          hidden
          disabled={uploading}
          onChange={(e) => accept(e.target.files)}
        />

        {uploading ? (
          <>
            <div className="loading-spinner" />
            <strong style={{ fontSize: "1rem", color: "var(--text-primary)" }}>{PHASES[phase]}</strong>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Processing text, generating embeddings, and storing in private vector collection.
            </span>
          </>
        ) : file ? (
          <>
            <span style={{ color: "var(--accent-primary)" }}><DocIcon size={32} /></span>
            <strong style={{ fontSize: "1rem", color: "var(--text-primary)" }}>{file.name}</strong>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              {(file.size / (1024 * 1024)).toFixed(2)} MB • Ready to index
            </span>
          </>
        ) : (
          <>
            <span style={{ color: "var(--accent-primary)" }}><UploadIcon size={32} /></span>
            <strong style={{ fontSize: "1.05rem", color: "var(--text-primary)" }}>
              {t["upload.drag"]}
            </strong>
            <span style={{ fontSize: "0.86rem", color: "var(--text-secondary)" }}>
              or <span style={{ color: "var(--accent-primary)", fontWeight: "600", textDecoration: "underline" }}>{t["upload.browse"]}</span>
            </span>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              PDF format only • Max 25 MB • Isolated to your account
            </span>
          </>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "1rem" }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => onUpload()}
          disabled={!file || uploading}
        >
          <UploadIcon size={15} />
          {uploading ? "Indexing in progress..." : t["upload.btn"]}
        </button>

        {file && !uploading && (
          <button type="button" className="btn btn-ghost" onClick={() => setFile(null)}>
            {t["upload.clear"]}
          </button>
        )}
      </div>

      {status && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.75rem 1rem",
          borderRadius: "var(--radius-md)",
          marginTop: "1rem",
          backgroundColor: status.type === "success" ? "var(--success-bg)" : status.type === "error" ? "var(--danger-bg)" : "var(--bg-subtle)",
          border: `1px solid ${status.type === "success" ? "var(--success-border)" : status.type === "error" ? "var(--danger-border)" : "var(--border)"}`,
          color: status.type === "success" ? "var(--success)" : status.type === "error" ? "var(--danger)" : "var(--text-secondary)",
          fontSize: "0.85rem",
        }}>
          {status.type === "success" ? <CheckIcon size={16} /> : status.type === "error" ? <AlertIcon size={16} /> : <DocIcon size={16} />}
          <span>{status.message}</span>
        </div>
      )}
    </section>
  );
}