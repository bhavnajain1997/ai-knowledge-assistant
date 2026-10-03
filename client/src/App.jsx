import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import DocumentUpload from "./components/DocumentUpload.jsx";
import DocumentList from "./components/DocumentList.jsx";
import TabNav from "./components/TabNav.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import ConversationList from "./components/ConversationList.jsx";
import SummaryPanel from "./components/SummaryPanel.jsx";
import QuizPanel from "./components/QuizPanel.jsx";
import {
  fetchDocuments,
  deleteDocument as apiDeleteDocument,
  fetchSessions,
  deleteSession as apiDeleteSession,
  renameSession as apiRenameSession,
} from "./services/api.js";

const LAST_SESSION_KEY = "athenaeum:lastSessionId";

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [tab, setTab] = useState("chat");
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState(
    () => localStorage.getItem(LAST_SESSION_KEY) || null
  );

  useEffect(() => {
    fetchDocuments()
      .then((docs) => {
        setDocuments(docs);
        setSelectedIds(docs.map((d) => d.id));
      })
      .finally(() => setLoadingDocs(false));

    refreshSessions();
  }, []);

  useEffect(() => {
    if (activeSessionId) localStorage.setItem(LAST_SESSION_KEY, activeSessionId);
    else localStorage.removeItem(LAST_SESSION_KEY);
  }, [activeSessionId]);

  async function refreshSessions() {
    setLoadingSessions(true);
    try {
      const list = await fetchSessions();
      setSessions(list);
      // If our remembered session no longer exists (e.g. deleted elsewhere), clear it.
      if (activeSessionId && !list.some((s) => s.id === activeSessionId)) {
        setActiveSessionId(null);
      }
    } finally {
      setLoadingSessions(false);
    }
  }

  function handleUploaded(doc) {
    setDocuments((prev) => [doc, ...prev]);
    setSelectedIds((prev) => [...prev, doc.id]);
    setActiveDocId(doc.id);
  }

  function handleToggleSelect(id) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleDeleteDocument(id) {
    await apiDeleteDocument(id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    if (activeDocId === id) setActiveDocId(null);
  }

  async function handleDeleteSession(id) {
    await apiDeleteSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) setActiveSessionId(null);
  }

  async function handleRenameSession(id, title) {
    await apiRenameSession(id, title);
    setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, title } : s)));
  }

  function handleSelectSession(id) {
    setActiveSessionId(id);
    setTab("chat");
  }

  function handleNewChat() {
    setActiveSessionId(null);
    setTab("chat");
  }

  const activeDoc = documents.find((d) => d.id === activeDocId) || null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-ink-950">
      {/* Single sidebar column: upload, library, and conversations together */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-ink-800">
        <Header />
        <div className="scrollbar-thin flex-1 overflow-y-auto px-4 py-4">
          <DocumentUpload onUploaded={handleUploaded} />

          <div className="mt-5">
            <p className="mb-2 px-1 text-[11px] font-mono uppercase tracking-wider text-parchment-300/40">
              Library {documents.length > 0 && `(${documents.length})`}
            </p>
            {loadingDocs ? (
              <p className="px-1 text-xs text-parchment-300/50">Loading…</p>
            ) : (
              <DocumentList
                documents={documents}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onDelete={handleDeleteDocument}
                activeDocId={activeDocId}
                onSetActive={setActiveDocId}
              />
            )}
          </div>

          <div className="mt-5 border-t border-ink-800 pt-4">
            <p className="mb-2 px-1 text-[11px] font-mono uppercase tracking-wider text-parchment-300/40">
              Conversations {sessions.length > 0 && `(${sessions.length})`}
            </p>
            <ConversationList
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelect={handleSelectSession}
              onNew={handleNewChat}
              onDelete={handleDeleteSession}
              onRename={handleRenameSession}
              loading={loadingSessions}
            />
          </div>
        </div>
        <div className="border-t border-ink-800 px-4 py-3">
          <p className="text-[11px] leading-relaxed text-parchment-300/40">
            Checked sources are used as chat context. Click a document to view its summary
            or generate a quiz.
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <TabNav active={tab} onChange={setTab} />
        </div>

        <div className="flex-1 overflow-hidden">
          {tab === "chat" && (
            <ChatPanel
              documents={documents}
              selectedIds={selectedIds}
              sessionId={activeSessionId}
              onSessionCreated={(id) => {
                setActiveSessionId(id);
                refreshSessions();
              }}
              onSessionUpdated={refreshSessions}
            />
          )}
          {tab === "summary" && <SummaryPanel activeDoc={activeDoc} />}
          {tab === "quiz" && <QuizPanel activeDoc={activeDoc} />}
        </div>
      </main>
    </div>
  );
}
