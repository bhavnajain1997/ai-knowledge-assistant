import { MessagesSquare, ScrollText, HelpCircle } from "lucide-react";

const TABS = [
  { id: "chat", label: "Chat", icon: MessagesSquare },
  { id: "summary", label: "Summary", icon: ScrollText },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
];

export default function TabNav({ active, onChange }) {
  return (
    <div className="flex gap-1 rounded-lg border border-ink-700 bg-ink-800/50 p-1">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
            active === id
              ? "bg-parchment-100 text-ink-900 shadow-card"
              : "text-parchment-300/70 hover:text-parchment-100"
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
}
