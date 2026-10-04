import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import App from "./App";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Nyay AI App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#f8fafc",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "24px",
          textAlign: "center"
        }}>
          <h2 style={{ fontSize: "24px", marginBottom: "12px", color: "#38bdf8" }}>Nyay AI Assistant</h2>
          <p style={{ color: "#f87171", marginBottom: "20px", maxWidth: "600px" }}>
            {this.state.error?.toString() || "An unexpected error occurred while loading the workspace."}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{
              padding: "12px 24px",
              background: "#2563eb",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(37,99,235,0.3)"
            }}
          >
            Reset Session & Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);