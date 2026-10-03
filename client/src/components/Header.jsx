import { Feather } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center gap-2.5 border-b border-ink-800 px-5 py-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brass-500/15">
        <Feather size={16} className="text-brass-400" />
      </div>
      <div>
        <h1 className="font-display text-lg leading-none text-parchment-100">Code Breaker</h1>
        <p className="text-[11px] leading-none text-parchment-300/50 mt-1">
          AI Knowledge Assistant
        </p>
      </div>
    </header>
  );
}
