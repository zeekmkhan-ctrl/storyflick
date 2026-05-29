import { Mood, MoodConfig } from "@/types";

export const MOOD_CONFIG: Record<Mood, MoodConfig> = {
  melancholic: {
    label: "Melancholic",
    emoji: "🌧️",
    bg: "from-slate-900 via-blue-950 to-slate-900",
    accent: "#3498db",
    textColor: "#74b9e8",
  },
  thrilling: {
    label: "Thrilling",
    emoji: "⚡",
    bg: "from-zinc-950 via-red-950 to-zinc-950",
    accent: "#e74c3c",
    textColor: "#f06b5d",
  },
  romantic: {
    label: "Romantic",
    emoji: "🌹",
    bg: "from-rose-950 via-pink-950 to-slate-950",
    accent: "#e91e8c",
    textColor: "#f472b6",
  },
  humorous: {
    label: "Humorous",
    emoji: "😄",
    bg: "from-amber-950 via-yellow-950 to-orange-950",
    accent: "#f59e0b",
    textColor: "#fcd34d",
  },
  mysterious: {
    label: "Mysterious",
    emoji: "🌑",
    bg: "from-violet-950 via-purple-950 to-slate-950",
    accent: "#8b5cf6",
    textColor: "#a78bfa",
  },
  hopeful: {
    label: "Hopeful",
    emoji: "🌅",
    bg: "from-teal-950 via-emerald-950 to-slate-950",
    accent: "#10b981",
    textColor: "#6ee7b7",
  },
  dark: {
    label: "Dark",
    emoji: "🕯️",
    bg: "from-stone-950 via-neutral-950 to-zinc-950",
    accent: "#d4a843",
    textColor: "#d4a843",
  },
  warm: {
    label: "Warm",
    emoji: "☕",
    bg: "from-orange-950 via-amber-950 to-stone-950",
    accent: "#d97706",
    textColor: "#fbbf24",
  },
};
