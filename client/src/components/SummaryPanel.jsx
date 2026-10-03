import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Loader2, ScrollText, RefreshCcw } from "lucide-react";
import { fetchSummary } from "../services/api.js";

export default function SummaryPanel({ activeDoc }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    if (!activeDoc) return;
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const res = await fetchSummary(activeDoc.id);
      setSummary(res.summary);
    } catch (err) {
      setError(err?.response?.data?.error || "Couldn't generate a summary.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDoc?.id]);

  if (!activeDoc) {
    return (
      <EmptyState message="Select a document from the library to see its summary." />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ScrollText size={18} className="text-brass-400" />
          <h2 className="font-display text-xl text-parchment-100">{activeDoc.name}</h2>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-md border border-ink-600 px-2.5 py-1.5 text-xs text-parchment-200 hover:border-brass-500 hover:text-brass-400 disabled:opacity-40"
        >
          <RefreshCcw size={12} /> Regenerate
        </button>
      </div>

      <div className="scrollbar-thin flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-parchment-300/60">
            <Loader2 className="animate-spin" size={16} /> Reading the full document…
          </div>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        {!loading && summary && (
          <div className="card-surface p-5">
            <div className="prose prose-sm prose-headings:font-display max-w-none text-ink-900">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <ScrollText size={28} className="mb-3 text-parchment-300/30" />
      <p className="max-w-xs text-sm text-parchment-300/60">{message}</p>
    </div>
  );
}
