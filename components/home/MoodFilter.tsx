"use client";
import { Mood } from "@/types";
import { MOOD_CONFIG } from "@/lib/moods";

interface MoodFilterProps {
  selected: Mood | null;
  onSelect: (mood: Mood | null) => void;
}

export default function MoodFilter({ selected, onSelect }: MoodFilterProps) {
  const moods = Object.entries(MOOD_CONFIG) as [Mood, (typeof MOOD_CONFIG)[Mood]][];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: "none" }}>
      <button
        onClick={() => onSelect(null)}
        className={`flex-shrink-0 text-xs font-body font-medium px-3.5 py-2 rounded-full border transition-all duration-200 ${
          selected === null
            ? "bg-gold-500/20 border-gold-500/40 text-gold-300"
            : "bg-ink-800/50 border-white/8 text-ink-400 hover:text-ink-200"
        }`}
      >
        ✦ All
      </button>

      {moods.map(([mood, config]) => (
        <button
          key={mood}
          onClick={() => onSelect(selected === mood ? null : mood)}
          className={`flex-shrink-0 text-xs font-body font-medium px-3.5 py-2 rounded-full border transition-all duration-200 whitespace-nowrap`}
          style={
            selected === mood
              ? {
                  backgroundColor: `${config.accent}20`,
                  borderColor: `${config.accent}50`,
                  color: config.textColor,
                }
              : {
                  backgroundColor: "rgba(255,255,255,0.04)",
                  borderColor: "rgba(255,255,255,0.08)",
                  color: "#6b7280",
                }
          }
        >
          {config.emoji} {config.label}
        </button>
      ))}
    </div>
  );
}
