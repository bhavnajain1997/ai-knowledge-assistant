import { useState } from "react";
import { Plus, MessageSquare, Trash2, Pencil, Check, X } from "lucide-react";

function timeAgo(iso) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

/**
 * Embeddable conversation list — no fixed width/height/scroll container of
 * its own, so it can sit inline inside a parent sidebar column alongside
 * document upload/library instead of taking up a separate layout column.
 */
export default function ConversationList({
  sessions,
  activeSessionId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  loading,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");

  function startEdit(session) {
    setEditingId(session.id);
    setDraftTitle(session.title);
  }

  async function commitEdit() {
    if (draftTitle.trim()) await onRename(editingId, draftTitle.trim());
    setEditingId(null);
  }

  return (
    <div>
      <button
        onClick={onNew}
        className="mb-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-ink-600 py-1.5 text-xs text-parchment-200 hover:border-brass-500 hover:text-brass-400 transition-colors"
      >
        <Plus size={13} /> New chat
      </button>

      <div className="space-y-1">
        {loading && <p className="px-1 text-xs text-parchment-300/50">Loading…</p>}

        {!loading && sessions.length === 0 && (
          <p className="px-1 text-xs italic text-parchment-300/40">
            No conversations yet.
          </p>
        )}

        {sessions.map((s) => {
          const active = s.id === activeSessionId;
          const isEditing = editingId === s.id;
          return (
            <div
              key={s.id}
              className={`group rounded-md border px-2 py-1.5 transition-colors ${
                active
                  ? "border-brass-500/60 bg-brass-500/10"
                  : "border-transparent hover:bg-ink-800/60"
              }`}
            >
              {isEditing ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={draftTitle}
                    onChange={(e) => setDraftTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit();
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="min-w-0 flex-1 rounded bg-ink-950 px-1.5 py-1 text-xs text-parchment-100 outline-none ring-1 ring-brass-500"
                  />
                  <button onClick={commitEdit} className="text-moss-400 hover:text-moss-300">
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-parchment-300/50 hover:text-red-400"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <button onClick={() => onSelect(s.id)} className="flex w-full items-start gap-1.5 text-left">
                  <MessageSquare size={13} className="mt-0.5 shrink-0 text-parchment-300/50" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs text-parchment-100">{s.title}</p>
                    <p className="text-[10px] text-parchment-300/40">
                      {timeAgo(s.updatedAt)} · {s.messageCount} msg
                      {s.messageCount === 1 ? "" : "s"}
                    </p>
                  </div>
                </button>
              )}

              {!isEditing && (
                <div className="mt-1 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(s)}
                    className="text-parchment-300/40 hover:text-brass-400"
                    title="Rename"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="text-parchment-300/40 hover:text-red-400"
                    title="Delete"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
