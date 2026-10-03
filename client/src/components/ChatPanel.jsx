import { useEffect, useRef, useState } from "react";
import { SendHorizontal } from "lucide-react";
import MessageBubble from "./MessageBubble.jsx";
import { askQuestion, fetchSession } from "../services/api.js";

const SUGGESTIONS = [
  "Summarize the key points of my documents",
  "What are the main conclusions?",
  "Explain this in simpler terms",
];

export default function ChatPanel({
  documents,
  selectedIds,
  sessionId,
  onSessionCreated,
  onSessionUpdated,
}) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const scrollRef = useRef(null);

  // Load the full conversation whenever the active session changes
  // (e.g. picking a past conversation from the list, or starting a new one).
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!sessionId) {
        setMessages([]);
        return;
      }
      setLoadingSession(true);
      try {
        const session = await fetchSession(sessionId);
        if (!cancelled) {
          setMessages(
            session.messages.map((m) => ({
              role: m.role,
              content: m.content,
              citations: m.citations,
              groundedInDocuments: m.groundedInDocuments,
            }))
          );
        }
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoadingSession(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend(text) {
    const question = (text ?? input).trim();
    if (!question || sending) return;

    const userMsg = { role: "user", content: question };
    const loadingMsg = { role: "assistant", content: "", loading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInput("");
    setSending(true);

    try {
      const docIds = selectedIds.length > 0 ? selectedIds : null;
      const res = await askQuestion({ question, sessionId, docIds });

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content: res.answer,
          citations: res.citations,
          groundedInDocuments: res.groundedInDocuments,
        },
      ]);

      if (!sessionId && res.sessionId) {
        onSessionCreated?.(res.sessionId);
      } else {
        onSessionUpdated?.();
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: "assistant",
          content:
            err?.response?.data?.error ||
            "Something went wrong reaching the assistant. Please try again.",
          groundedInDocuments: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={scrollRef}
        className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-1 py-2"
      >
        {loadingSession && (
          <p className="text-center text-xs text-parchment-300/50">Loading conversation…</p>
        )}

        {!loadingSession && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div>
              <h2 className="font-display text-2xl text-parchment-100">
                Ask your archive anything
              </h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-parchment-300/60">
                Answers are grounded in your uploaded sources, with citations. If nothing
                relevant is found, I'll fall back to general knowledge and say so.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="rounded-full border border-ink-600 px-3 py-1.5 text-xs text-parchment-200 hover:border-brass-500 hover:text-brass-400 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {!loadingSession &&
          messages.map((m, i) => <MessageBubble key={i} message={m} />)}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="mt-3 flex items-end gap-2 rounded-xl border border-ink-600 bg-ink-800/60 p-2"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          rows={1}
          placeholder={
            documents.length === 0
              ? "Ask anything — no documents yet, so I'll use general knowledge…"
              : "Ask a question about your documents…"
          }
          className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-parchment-100 placeholder:text-parchment-300/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brass-500 text-ink-950 transition-colors hover:bg-brass-400 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <SendHorizontal size={16} />
        </button>
      </form>
    </div>
  );
}
