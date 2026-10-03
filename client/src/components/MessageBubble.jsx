import ReactMarkdown from "react-markdown";
import { BookOpen, Sparkles, User } from "lucide-react";
import CitationBadge from "./CitationBadge.jsx";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="flex max-w-[80%] items-start gap-2">
          <div className="rounded-xl rounded-tr-sm bg-moss-500 px-4 py-2.5 text-parchment-50 shadow-card">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink-700">
            <User size={14} className="text-parchment-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[85%] items-start gap-2">
        <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brass-500/20">
          {message.groundedInDocuments ? (
            <BookOpen size={14} className="text-brass-400" />
          ) : (
            <Sparkles size={14} className="text-brass-400" />
          )}
        </div>
        <div className="card-surface rounded-tl-sm px-4 py-3 space-y-3">
          {!message.groundedInDocuments && !message.loading && (
            <span className="index-tab inline-block">general knowledge</span>
          )}
          <div className="prose prose-sm prose-headings:font-display max-w-none text-ink-900 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
            {message.loading ? (
              <span className="inline-flex items-center gap-1 text-ink-700/60 text-sm">
                <span className="animate-pulse">Thinking…</span>
              </span>
            ) : (
              <ReactMarkdown>{message.content}</ReactMarkdown>
            )}
          </div>

          {message.citations?.length > 0 && (
            <div className="space-y-1.5 border-t border-ink-900/10 pt-2.5">
              <p className="text-[11px] font-mono uppercase tracking-wider text-ink-900/40">
                Sources
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {message.citations.map((c, i) => (
                  <CitationBadge key={i} citation={c} number={i + 1} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
