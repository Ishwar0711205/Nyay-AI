import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

import AuthPage from "./components/AuthPage";
import TopNav, { currentView } from "./components/TopNav";
import Footer from "./components/Footer";
import Toasts from "./components/Toasts";
import Sidebar from "./components/Sidebar";
import DocumentReader from "./components/DocumentReader";

import ResearchPage from "./components/pages/ResearchPage";
import DocumentsPage from "./components/pages/DocumentsPage";
import HowItWorksPage from "./components/pages/HowItWorksPage";
import SystemPage from "./components/pages/SystemPage";
import EvaluationPage from "./components/pages/EvaluationPage";
import AboutPage from "./components/pages/AboutPage";
import ThreeBackground from "./components/ThreeBackground";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("nyay_token") || "");
  const [profile, setProfile] = useState(null);

  const [theme, setTheme] = useState(localStorage.getItem("nyay_theme") || "light");
  const [language, setLanguageState] = useState(localStorage.getItem("nyay_lang") || "en");

  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("both");
  const [turns, setTurns] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docChunks, setDocChunks] = useState({});

  const [inspectSource, setInspectSource] = useState(null);

  const [view, setView] = useState(currentView());
  const [toasts, setToasts] = useState([]);

  const questionRef = useRef(null);
  const uploadRef = useRef(null);

  function setLanguage(lang) {
    setLanguageState(lang);
    localStorage.setItem("nyay_lang", lang);
  }

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("nyay_theme", theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }

  useEffect(() => {
    const onHash = () => setView(currentView());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  useEffect(() => {
    if (!token) return;
    api("/auth/me", {}, token)
      .then(setProfile)
      .catch(() => logout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadDocuments = useCallback(async () => {
    if (!token) return [];
    try {
      const data = await api("/documents", {}, token);
      setDocuments((data.documents || []).filter((d) => d && d.document_id));
      return data.documents || [];
    } catch {
      return [];
    }
  }, [token]);

  const loadSessions = useCallback(async () => {
    if (!token) return;
    try {
      const data = await api("/sessions", {}, token);
      setSessions(data.sessions || []);
    } catch {
      setSessions([]);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadDocuments();
      loadSessions();
    }
  }, [token, loadDocuments, loadSessions]);

  function notify(type, message) {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }

  function dismissToast(id) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function navigate(id) {
    const target = `#/${id}`;
    if (window.location.hash === target) {
      setView(id);
    } else {
      window.location.hash = target;
    }
  }

  function logout() {
    localStorage.removeItem("nyay_token");
    setToken("");
    setProfile(null);
    setTurns([]);
    setSessionId("");
    setSessions([]);
    setQuery("");
    setUploadStatus(null);
    setFile(null);
  }

  async function authenticate(authMode, username, password) {
    const data = await api(`/auth/${authMode === "login" ? "login" : "register"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    localStorage.setItem("nyay_token", data.access_token);
    setToken(data.access_token);
    setProfile(data);
    navigate("research");
    return data;
  }

  async function handleUpload() {
    if (!file) return;
    if (!profile?.workspace_id) {
      notify("error", "Your workspace is loading. Please try again in a moment.");
      return;
    }
    setUploading(true);
    setUploadStatus(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const data = await api(
        `/upload?workspace_id=${encodeURIComponent(profile.workspace_id)}`,
        { method: "POST", body },
        token
      );
      if (data.duplicate) {
        setUploadStatus({ type: "info", message: "This PDF is already indexed in your workspace." });
        notify("info", "This PDF is already in your workspace.");
      } else {
        setUploadStatus({
          type: "success",
          message: `Document indexed successfully — ${data.chunks_added} chunks added.`,
        });
        setDocChunks((prev) => ({ ...prev, [data.document_id]: data.chunks_added }));
        notify("success", `Indexed “${data.filename}” (${data.chunks_added} chunks).`);
      }
      setFile(null);
      await loadDocuments();
    } catch (err) {
      setUploadStatus({ type: "error", message: err.message });
      notify("error", `Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleDeleteDocument(documentId) {
    try {
      await api(`/documents/${documentId}`, { method: "DELETE" }, token);
      notify("success", "Document removed from private workspace.");
      await loadDocuments();
    } catch (err) {
      notify("error", `Failed to delete document: ${err.message}`);
    }
  }

  async function ask(questionOverride, turnIdToRetry = null) {
    const q = (questionOverride || query).trim();
    if (!q || loading) return;

    setLoading(true);
    let targetTurnId = turnIdToRetry;

    if (targetTurnId) {
      // Retrying existing turn in-place to prevent duplicate cards
      setTurns((prev) =>
        prev.map((t) => (t.id === targetTurnId ? { ...t, result: null, error: null } : t))
      );
    } else {
      // Submitting new query
      setQuery("");
      const newTurn = { id: Date.now(), question: q, result: null, error: null };
      targetTurnId = newTurn.id;
      setTurns((prev) => [newTurn, ...prev]);
    }

    try {
      const data = await api(
        "/query",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: q,
            workspace_id: profile?.workspace_id || null,
            session_id: sessionId || null,
            mode,
            language,
          }),
        },
        token
      );
      if (data.session_id) setSessionId(data.session_id);
      setTurns((prev) =>
        prev.map((t) => (t.id === targetTurnId ? { ...t, result: data, error: null } : t))
      );
      loadSessions();
    } catch (err) {
      setTurns((prev) =>
        prev.map((t) => (t.id === targetTurnId ? { ...t, error: err.message, result: null } : t))
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectSession(sid) {
    setSessionId(sid);
    try {
      const data = await api(`/sessions/${sid}`, {}, token);
      if (data.messages && data.messages.length > 0) {
        const reconstructed = [];
        for (let i = 0; i < data.messages.length; i += 2) {
          const userMsg = data.messages[i];
          const botMsg = data.messages[i + 1];
          if (userMsg && userMsg.role === "user") {
            reconstructed.push({
              id: Date.now() + i,
              question: userMsg.content,
              result: botMsg ? { answer: botMsg.content, citations: [] } : null,
              error: null,
            });
          }
        }
        setTurns(reconstructed.reverse());
        navigate("research");
      }
    } catch {
      notify("error", "Unable to load session history.");
    }
  }

  function clearConversation() {
    setTurns([]);
    setSessionId("");
    setQuery("");
  }

  function focusQuestion() {
    clearConversation();
    setTimeout(() => questionRef.current?.focus(), 50);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function pickExample(q) {
    setQuery(q);
    setTimeout(() => {
      questionRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  function goToDocuments() {
    navigate("documents");
  }

  function searchDocument(d) {
    setMode("user");
    if (d?.law_name || d?.filename) {
      setQuery(`Regarding ${d.law_name || d.filename}: `);
    }
    navigate("research");
    setTimeout(() => {
      questionRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  function searchOfficialDocument(doc) {
    setMode("official");
    if (doc?.title) {
      setQuery(`Under ${doc.title}, `);
    }
    navigate("research");
    setTimeout(() => {
      questionRef.current?.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }

  if (!token) {
    return <AuthPage onAuthenticate={authenticate} language={language} setLanguage={setLanguage} />;
  }

  if (token && !profile) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-app)",
        color: "var(--text-primary)",
      }}>
        <div style={{ fontSize: "1.25rem", fontWeight: "700", marginBottom: "8px" }}>Nyay AI</div>
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Loading your private legal workspace...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <ThreeBackground theme={theme} view={view} />
      <TopNav
        view={view}
        username={profile?.username}
        workspaceId={profile?.workspace_id}
        onLogout={logout}
        theme={theme}
        onToggleTheme={toggleTheme}
        language={language}
        setLanguage={setLanguage}
      />

      <div className={`layout ${view === "research" ? "layout-app" : "layout-page"}`}>
        {view === "research" && (
          <Sidebar
            workspaceId={profile?.workspace_id}
            documents={documents}
            docChunks={docChunks}
            sessions={sessions}
            activeSessionId={sessionId}
            onSelectSession={handleSelectSession}
            onFocusQuestion={focusQuestion}
            onGoToDocuments={goToDocuments}
            onClear={clearConversation}
            language={language}
          />
        )}

        <main className="content">
          {view === "research" && (
            <ResearchPage
              inputRef={questionRef}
              query={query}
              setQuery={setQuery}
              mode={mode}
              setMode={setMode}
              language={language}
              setLanguage={setLanguage}
              turns={turns}
              loading={loading}
              ask={ask}
              pickExample={pickExample}
              onInspectSource={setInspectSource}
            />
          )}

          {view === "documents" && (
            <DocumentsPage
              file={file}
              setFile={setFile}
              handleUpload={handleUpload}
              uploading={uploading}
              uploadStatus={uploadStatus}
              onUploadError={(message) => setUploadStatus({ type: "error", message })}
              documents={documents}
              docChunks={docChunks}
              onSearchDocument={searchDocument}
              onSearchOfficialDocument={searchOfficialDocument}
              onDeleteDocument={handleDeleteDocument}
              token={token}
              language={language}
            />
          )}

          {view === "how-it-works" && <HowItWorksPage language={language} />}
          {view === "system" && <SystemPage language={language} />}
          {view === "evaluation" && <EvaluationPage language={language} />}
          {view === "about" && <AboutPage language={language} />}

          <div ref={uploadRef} aria-hidden="true" />
        </main>
      </div>

      <Footer language={language} />
      <Toasts toasts={toasts} onDismiss={dismissToast} />

      {/* Document Excerpt Inspection Modal */}
      {inspectSource && (
        <DocumentReader
          source={inspectSource}
          onClose={() => setInspectSource(null)}
        />
      )}
    </div>
  );
}