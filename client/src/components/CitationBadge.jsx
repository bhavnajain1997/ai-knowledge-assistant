export default function CitationBadge({ citation, number }) {
  const pct = Math.round((citation.relevanceScore || 0) * 100);
  return (
    <div className="relative flex items-start gap-2 rounded-md border border-ink-600 bg-ink-800/60 px-2.5 py-2">
      <span className="index-tab shrink-0">S{number}</span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-parchment-100">
          {citation.documentName}{" "}
          <span className="text-parchment-300/40 font-normal">· chunk {citation.chunkIndex}</span>
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-parchment-300/70 line-clamp-2">
          {citation.snippet}
        </p>
        <p className="mt-1 font-mono text-[10px] text-moss-400">{pct}% match</p>
      </div>
    </div>
  );
}
