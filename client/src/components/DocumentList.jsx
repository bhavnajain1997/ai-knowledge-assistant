import { FileText, Trash2, CheckSquare, Square } from "lucide-react";

export default function DocumentList({
  documents,
  selectedIds,
  onToggleSelect,
  onDelete,
  activeDocId,
  onSetActive,
}) {
  if (documents.length === 0) {
    return (
      <p className="text-xs text-parchment-300/50 italic px-1 py-3">
        No sources yet. Upload a document to begin building your archive.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {documents.map((doc) => {
        const selected = selectedIds.includes(doc.id);
        return (
          <li
            key={doc.id}
            className={`group flex items-center gap-2 rounded-md px-2 py-2 border transition-colors ${
              activeDocId === doc.id
                ? "border-brass-500/60 bg-brass-500/10"
                : "border-transparent hover:bg-ink-800/60"
            }`}
          >
            <button
              onClick={() => onToggleSelect(doc.id)}
              title={selected ? "Exclude from chat context" : "Include in chat context"}
              className="shrink-0 text-moss-400 hover:text-moss-300"
            >
              {selected ? <CheckSquare size={16} /> : <Square size={16} />}
            </button>

            <button
              onClick={() => onSetActive(doc.id)}
              className="flex-1 flex items-center gap-2 min-w-0 text-left"
            >
              <FileText size={15} className="shrink-0 text-parchment-300/70" />
              <span className="truncate text-sm text-parchment-100">{doc.name}</span>
            </button>

            <button
              onClick={() => onDelete(doc.id)}
              className="shrink-0 opacity-0 group-hover:opacity-100 text-parchment-300/50 hover:text-red-400 transition-opacity"
              title="Delete document"
            >
              <Trash2 size={14} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
