"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";
import StoryCard from "@/components/home/StoryCard";
import MoodFilter from "@/components/home/MoodFilter";
import Navbar from "@/components/ui/Navbar";
import Onboarding from "@/components/ui/Onboarding";
import { STORIES } from "@/data/stories";
import { Mood, Story } from "@/types";
import { useUser } from "@/lib/userContext";
import { isOnboarded } from "@/lib/storage";
import { client } from "@/lib/sanity";

// ─── GROQ query that matches exactly what the app's Story type expects ───────
// Key fixes vs the old query:
//   1.  "id": id          → renames Sanity's custom `id` field to JS key `id`
//   2.  author { ... }    → inline object (not author-> reference) matching schema
//   3.  "visualPrompt":   → added so SceneReader doesn't blow up on undefined
const STORIES_QUERY = `*[_type == "story"] | order(publishedAt desc) {
  "id": id,
  title,
  tagline,
  mood,
  totalReadMinutes,
  publishedAt,
  featured,
  tags,
  author {
    id,
    name,
    bio,
    avatar,
    avatarColor,
    storiesCount,
    joinedDate
  },
  scenes[] {
    id,
    sceneNumber,
    ambientEmoji,
    bgClass,
    text,
    "visualPrompt": coalesce(visualPrompt, "")
  }
}`;

export default function HomePage() {
  const { user } = useUser();
  const [stories, setStories] = useState<Story[]>(STORIES); // start with local fallback
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const featuredRef = useRef<HTMLDivElement>(null);
  const moodRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [bgPos, setBgPos] = useState<string>("25% center");
  const router = useRouter();

  useEffect(() => {
    if (!isOnboarded()) {
      const timer = setTimeout(() => setShowOnboarding(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  // ─── Fetch from Sanity, replace local data when available ─────────────────
  useEffect(() => {
    client
      .fetch<Story[]>(STORIES_QUERY)
      .then((data) => {
        // Only replace local stories if Sanity actually returned something.
        // This means: as long as you have at least 1 published story in Sanity,
        // the app shows Sanity data and ignores data/stories.ts entirely.
        if (Array.isArray(data) && data.length > 0) {
          setStories(data);
        }
        // If Sanity returns empty (no published stories yet), keep local fallback.
      })
      .catch((err) => {
        console.error("Sanity fetch failed, using local stories:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const featured = stories.filter((s) => s.featured);
  const filtered = selectedMood
    ? stories.filter((s) => s.mood === selectedMood)
    : stories;

  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  const isSunday = day === 0;
  const ambientLabel = isSunday
    ? "Sunday"
    : hour >= 21
    ? "Night"
    : hour >= 17
    ? "Late evening"
    : hour >= 12
    ? "Afternoon"
    : "Morning";
  const ambientMessage = isSunday
    ? "Slow Sundays deserve soft stories."
    : hour >= 21
    ? "A quiet story before sleep?"
    : hour >= 17
    ? "Perfect weather for a story."
    : hour >= 12
    ? "The world can wait. Read awhile."
    : "Slow mornings deserve gentle stories.";

  const handleStepInside = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (e?.altKey || e?.metaKey) {
      if (featured[0]) router.push(`/read/${encodeURIComponent(featured[0].id)}`);
      return;
    }
    moodRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const onScroll = () => {
      const el = heroRef.current;
      if (!el) return setHeroOpacity(0);
      const rect = el.getBoundingClientRect();
      const height = rect.height || window.innerHeight * 0.5;
      const scrolled = Math.min(Math.max(-rect.top, 0), height);
      const t = scrolled / height;
      setHeroOpacity(1 - t);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      if (w < 640) setBgPos("10% center");
      else if (w < 1024) setBgPos("16% center");
      else setBgPos("20% center");
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden" style={{ background: 'linear-gradient(180deg, #0b0d12 0%, #111318 28%, #16151b 65%, #141418 100%)' }}>
      <Navbar />

      <section
        ref={heroRef}
        className="relative w-full h-[52vh] sm:h-[58vh] lg:h-[54vh] overflow-hidden"
        style={{ backgroundImage: "url('/hero-window.jpg')", backgroundSize: 'cover', backgroundPosition: bgPos, opacity: heroOpacity }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),transparent_28%),radial-gradient(circle_at_center,_rgba(255,255,255,0.02),transparent_40%)] opacity-80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-950/45 to-transparent" style={{ opacity: heroOpacity }} />
        <div className="absolute inset-x-0 bottom-0 h-72 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(11,13,18,0), rgba(17,19,24,0.7) 35%, rgba(20,20,24,0.94) 100%)' }} />
        <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none" style={{ background: 'radial-gradient(circle at 50% 10%, rgba(255,180,100,0.06), transparent 32%)' }} />

        <main className="relative z-10 pt-14 pb-6 px-4 max-w-lg mx-auto">
          <div className="relative z-10 max-w-sm">
            <h1 className="font-display text-5xl sm:text-6xl font-semibold text-white leading-tight drop-shadow-[0_18px_35px_rgba(0,0,0,0.35)]">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"}, {user ? user.name.split(" ")[0] : "Reader"}
            </h1>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.24em] text-slate-200 shadow-sm mt-6 mb-3">
              <span className="text-ink-100 font-medium">{ambientLabel}</span>
            </div>

            <div className="mt-4 space-y-3 text-slate-200">
              <p className="font-body text-base italic leading-relaxed drop-shadow-[0_10px_25px_rgba(0,0,0,0.22)]">{ambientMessage}</p>
              <p className="font-body text-base italic leading-relaxed drop-shadow-[0_10px_25px_rgba(0,0,0,0.22)]">Step away from the noise.</p>
              <p className="font-body text-base italic leading-relaxed drop-shadow-[0_10px_25px_rgba(0,0,0,0.22)]">Open a story.</p>
            </div>

            <button onClick={handleStepInside} className="mt-6 px-5 py-3 rounded-full border border-slate-200/20 bg-[#FDFBF7] text-black text-sm font-semibold shadow-xl hover:bg-[#f5f1e6] transition">
              Step Inside →
            </button>
          </div>
        </main>
      </section>

      <main className="relative z-10 pb-32 px-4 max-w-lg mx-auto">
        {!selectedMood && (
          <section ref={featuredRef} className="mb-4 mt-0">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={13} className="text-gold-400" />
              <span className="text-xs font-body font-medium text-ink-300 tracking-wide uppercase">Featured</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {featured.map((story, i) => (
                <div key={story.id} className="flex-shrink-0 w-[66vw] max-w-[240px]">
                  <StoryCard story={story} index={i} hideActions />
                </div>
              ))}
            </div>
          </section>
        )}

        <div ref={moodRef} className="mb-5">
          <MoodFilter selected={selectedMood} onSelect={setSelectedMood} />
        </div>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-body font-medium text-ink-300 tracking-wide uppercase">
              {selectedMood ? `${filtered.length} stories` : "All Stories"}
            </span>
            {/* Show a subtle loading indicator while Sanity is fetching */}
            {loading && (
              <span className="text-xs text-ink-500 font-body ml-1">· loading…</span>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-ink-500">
              <p className="text-3xl mb-3">🌑</p>
              <p className="font-body text-sm">No stories in this mood yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtered.map((story, i) => (
                <StoryCard key={story.id} story={story} index={i} />
              ))}
            </div>
          )}
        </section>
      </main>

      {showOnboarding && (
        <Onboarding onClose={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}