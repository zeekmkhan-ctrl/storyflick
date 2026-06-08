"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight,
  AlignJustify, X, Type, Minus, Plus
} from "lucide-react";
import { Scene, Story } from "@/types";
import { MOOD_CONFIG } from "@/lib/moods";
import { useUser } from "@/lib/userContext";
import { saveProgress } from "@/lib/storage";

interface SceneReaderProps { story: Story; }

type FontChoice = "playfair" | "lora" | "merriweather";
type LineHeight = "normal" | "relaxed" | "loose";

const AMBIENT: Record<string, { icon: string; label: string }> = {
  "the-last-monsoon":         { icon: "🌧", label: "Rain" },
  "the-forwarding-address":   { icon: "📮", label: "Night" },
  "last-train-to-anywhere":   { icon: "🚂", label: "Journey" },
  "the-night-watchman":       { icon: "🌑", label: "Midnight" },
  "chai-for-two":             { icon: "☕", label: "Morning" },
  "the-joke":                 { icon: "🕯", label: "Evening" },
};

const FONTS: Record<FontChoice, string> = {
  playfair:     "'Playfair Display', Georgia, serif",
  lora:        "Lora, Georgia, serif",
  merriweather: "Merriweather, Georgia, serif",
};

const LINE_HEIGHTS: Record<LineHeight, string> = {
  normal:  "1.75",
  relaxed: "2.1",
  loose:   "2.3",
};

function getSceneImageUrl(s: Scene): string {
  if (s.sceneImageUrl) return s.sceneImageUrl;
  const maybe = s as Scene & { sceneImage?: { asset?: { url?: string } } };
  return maybe.sceneImage?.asset?.url ?? "";
}

function SceneBackground({ scene, visible }: { scene: Scene; visible: boolean }) {
  const imageUrl = getSceneImageUrl(scene);

  return (
    <div
      className="absolute inset-0 transition-opacity duration-700 ease-in-out"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${scene.bgClass || "from-slate-900 via-blue-950 to-slate-900"}`} />
      )}

      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-transparent" />

      {scene.ambientEmoji && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
          <span
            className="select-none"
            style={{ fontSize: "clamp(160px,45vw,280px)", opacity: 0.04, filter: "blur(2px)" }}
          >
            {scene.ambientEmoji}
          </span>
        </div>
      )}
    </div>
  );
}

export default function SceneReader({ story }: SceneReaderProps) {
  const router = useRouter();
  const { user, toggleBookmark, markCompleted, isBookmarked } = useUser();

  const [currentScene, setCurrentScene] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [showSceneList, setShowSceneList] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [bookmarkFlash, setBookmarkFlash] = useState(false);

  const [fontSize, setFontSize] = useState(18);
  const [font, setFont] = useState<FontChoice>("playfair");
  const [lineHeight, setLineHeight] = useState<LineHeight>("relaxed");

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDiff, setTouchDiff] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const turnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mood = MOOD_CONFIG[story.mood];
  const scene = story.scenes[currentScene];
  const totalScenes = story.scenes.length;
  const bookmarked = isBookmarked(story.id);
  const pct = Math.round(((currentScene + 1) / totalScenes) * 100);
  const ambient = AMBIENT[story.id] ?? { icon: "📖", label: "" };

  useEffect(() => {
    saveProgress({
      storyId: story.id,
      currentScene,
      completed: currentScene === totalScenes - 1,
      startedAt: new Date().toISOString(),
    });
  }, [story.id, currentScene, totalScenes]);

  useEffect(() => {
    return () => {
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    };
  }, []);

  const goToScene = useCallback((nextIndex: number) => {
    if (isTransitioning || nextIndex < 0 || nextIndex >= totalScenes || nextIndex === currentScene) return;

    setIsTransitioning(true);
    setTouchDiff(0);
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);

    turnTimerRef.current = setTimeout(() => {
      setCurrentScene(nextIndex);
      setAnimKey((k) => k + 1);
      setIsTransitioning(false);
      contentRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }, 350);
  }, [isTransitioning, totalScenes, currentScene]);

  const goNext = useCallback(() => {
    if (currentScene < totalScenes - 1) {
      goToScene(currentScene + 1);
    } else {
      setShowComplete(true);
      if (user) markCompleted(story.id);
    }
  }, [currentScene, totalScenes, user, markCompleted, story.id, goToScene]);

  const goPrev = useCallback(() => {
    if (currentScene > 0) goToScene(currentScene - 1);
  }, [currentScene, goToScene]);

  const handleBookmark = () => {
    toggleBookmark(story.id);
    setBookmarkFlash(true);
    setTimeout(() => setBookmarkFlash(false), 2000);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") { setShowSceneList(false); setShowSettings(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev]);

  const handleTouchStart = (e: React.TouchEvent) => { setTouchStart(e.touches[0].clientX); setTouchDiff(0); };
  const handleTouchMove = (e: React.TouchEvent) => { if (touchStart !== null) setTouchDiff(e.touches[0].clientX - touchStart); };
  const handleTouchEnd = () => { if (Math.abs(touchDiff) > 60) { if (touchDiff < 0) goNext(); else goPrev(); } setTouchStart(null); setTouchDiff(0); };

  if (showComplete) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-6"
        style={{ background: `linear-gradient(160deg, #0a0a14, #13131f, #0d0d1a)` }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[260px] opacity-[0.03] select-none">{ambient.icon}</span>
        </div>
        <div className="relative z-10 text-center max-w-xs mx-auto" style={{ animation: "fadeUp .6s ease forwards" }}>
          <div className="text-5xl mb-5">{mood.emoji}</div>
          <div className="w-12 h-px mx-auto mb-5" style={{ background: mood.accent }} />
          <h2 className="font-display text-2xl font-bold text-white mb-2 leading-tight">{story.title}</h2>
          <p className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>by {story.author?.name || "Guest Contributor"}</p>
          <p className="text-xs mb-8" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}>Story complete · {story.totalReadMinutes} min read</p>

          {user && user.readingStreak > 0 && (
            <div className="flex items-center justify-center gap-3 rounded-2xl px-5 py-3 mb-6 border"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }}>
              <span className="text-2xl">🔥</span>
              <div className="text-left">
                <p className="text-sm font-medium text-white" style={{ fontFamily: "var(--font-body)" }}>{user.readingStreak} day streak</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>Come back tomorrow</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button onClick={() => router.push("/")}
              className="w-full py-4 rounded-2xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: mood.accent, color: "#07070f", fontFamily: "var(--font-body)" }}>
              Find Another Story
            </button>
            <button onClick={() => { setShowComplete(false); setCurrentScene(0); setAnimKey((k) => k + 1); }}
              className="w-full py-3.5 rounded-2xl text-sm border transition-all active:scale-95"
              style={{ color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", fontFamily: "var(--font-body)" }}>
              Read Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 overflow-hidden flex flex-col bg-black"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <SceneBackground scene={scene} visible={!isTransitioning} />
      </div>

      <div className="relative flex-shrink-0" style={{ zIndex: 10, paddingTop: "env(safe-area-inset-top)" }}>
        <div className="px-5 pt-3 pb-2">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => router.back()}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-90"
              style={{ background: "rgba(0,0,0,0.35)", borderColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
              <ArrowLeft size={16} className="text-white" />
            </button>

            <div className="text-center flex-1 mx-4">
              <p className="text-sm font-semibold text-white leading-tight" style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
                {story.title}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-body)" }}>
                by {story.author?.name || "Guest Contributor"}
              </p>
            </div>

            <button onClick={handleBookmark}
              className="w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-90"
              style={{ background: "rgba(0,0,0,0.35)", borderColor: bookmarked ? `${mood.accent}60` : "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
              {bookmarked
                ? <BookmarkCheck size={16} style={{ color: mood.accent }} />
                : <Bookmark size={16} className="text-white/60" />}
            </button>
          </div>

          <div className="relative h-[2px] rounded-full overflow-hidden mb-2" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${pct}%`, background: mood.accent, boxShadow: `0 0 8px ${mood.accent}80` }} />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
              {currentScene + 1} / {totalScenes}
            </span>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border"
              style={{ background: `${mood.accent}15`, borderColor: `${mood.accent}35`, backdropFilter: "blur(8px)" }}>
              <span className="text-xs">{mood.emoji}</span>
              <span className="text-[10px] font-medium tracking-wide"
                style={{ color: mood.textColor, fontFamily: "var(--font-body)" }}>
                {mood.label}
              </span>
            </div>

            <span className="text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.35)" }}>
              ~{Math.max(1, Math.ceil((totalScenes - currentScene) * (story.totalReadMinutes / totalScenes)))} min
            </span>
          </div>
        </div>
      </div>

      <div
        ref={contentRef}
        key={animKey}
        className="relative flex-1 overflow-y-auto px-6 py-4"
        style={{
          zIndex: 10,
          scrollbarWidth: "thin",
          animation: "fadeUp .5s ease forwards",
          opacity: isTransitioning ? 0.4 : 1,
          transition: "opacity 0.35s ease",
        }}
      >
        {bookmarkFlash && (
          <div className="sticky top-0 z-20 flex justify-center mb-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border"
              style={{ background: "rgba(0,0,0,0.7)", borderColor: `${mood.accent}50`, color: mood.textColor, backdropFilter: "blur(12px)", fontFamily: "var(--font-body)" }}>
              <BookmarkCheck size={13} /> {bookmarked ? "Bookmarked" : "Removed"}
            </div>
          </div>
        )}

        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70 mb-4">
          Scene {scene.sceneNumber}
        </p>

        {currentScene === 0 && (
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-8 leading-tight tracking-tight">
            {story.title}
          </h1>
        )}

        <div
          className="space-y-8 pb-8"
          style={{
            fontFamily: FONTS[font],
            fontSize: `${fontSize}px`,
            lineHeight: LINE_HEIGHTS[lineHeight],
            color: "rgba(231, 229, 228, 0.9)",
          }}
        >
          {scene.text.split("\n\n").map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="flex items-center justify-center gap-1.5 pb-4">
          {story.scenes.map((_, i) => (
            <button
              key={i}
              onClick={() => goToScene(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentScene ? "18px" : "6px",
                height: "6px",
                background: i === currentScene ? "rgba(251, 191, 36, 0.8)" : "rgba(255,255,255,0.25)",
              }}
              aria-label={`Go to scene ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="relative flex-shrink-0" style={{ zIndex: 10, paddingBottom: "env(safe-area-inset-bottom)", background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 70%, transparent 100%)" }}>
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={goPrev} disabled={currentScene === 0 || isTransitioning}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all active:scale-95 disabled:opacity-30"
              style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)", fontFamily: "var(--font-body)" }}>
              <ChevronLeft size={15} />
              <span>Prev</span>
            </button>

            <button onClick={handleBookmark}
              className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
              {bookmarked ? <BookmarkCheck size={17} style={{ color: mood.accent }} /> : <Bookmark size={17} className="text-white/50" />}
            </button>

            <button onClick={() => { setShowSceneList(true); setShowSettings(false); }}
              className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
              <AlignJustify size={17} className="text-white/50" />
            </button>

            <button onClick={() => { setShowSettings(true); setShowSceneList(false); }}
              className="w-11 h-11 rounded-xl flex items-center justify-center border transition-all active:scale-95"
              style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
              <Type size={17} className="text-white/50" />
            </button>

            <button onClick={goNext} disabled={isTransitioning}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: mood.accent, color: "#07070f", fontFamily: "var(--font-body)" }}>
              <span>{currentScene === totalScenes - 1 ? "Finish" : "Next Scene"}</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {showSceneList && (
        <div className="absolute inset-0 flex items-end" style={{ zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowSceneList(false)}>
          <div className="w-full rounded-t-3xl p-5" style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>All Scenes</h3>
              <button onClick={() => setShowSceneList(false)} className="text-white/40 hover:text-white/70"><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-1 mb-4 max-h-[50vh] overflow-y-auto">
              {story.scenes.map((sc, i) => (
                <button key={i} onClick={() => { goToScene(i); setShowSceneList(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
                  style={{ background: i === currentScene ? `${mood.accent}15` : "transparent", border: `1px solid ${i === currentScene ? `${mood.accent}30` : "transparent"}` }}>
                  <span className="text-xs font-mono w-4 flex-shrink-0" style={{ color: i === currentScene ? mood.textColor : "rgba(255,255,255,0.3)" }}>{i + 1}</span>
                  <span className="text-sm flex-1 truncate" style={{ color: i === currentScene ? "#fff" : "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>
                    {sc.text.slice(0, 60) || `Scene ${i + 1}`}
                  </span>
                  {i === currentScene && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: mood.accent }} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="absolute inset-0 flex items-end" style={{ zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowSettings(false)}>
          <div className="w-full rounded-t-3xl p-5" style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Reading Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white/70"><X size={18} /></button>
            </div>

            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>Text Size</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setFontSize((s) => Math.max(14, s - 1))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                  <Minus size={14} className="text-white/60" />
                </button>
                <span className="flex-1 text-center text-white text-sm" style={{ fontFamily: "var(--font-body)" }}>{fontSize}px</span>
                <button onClick={() => setFontSize((s) => Math.min(24, s + 1))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                  <Plus size={14} className="text-white/60" />
                </button>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>Font</p>
              <div className="flex gap-2">
                {(["playfair", "lora", "merriweather"] as FontChoice[]).map((f) => (
                  <button key={f} onClick={() => setFont(f)}
                    className="flex-1 py-2.5 rounded-xl text-xs border transition-all"
                    style={{
                      fontFamily: FONTS[f],
                      background: font === f ? `${mood.accent}20` : "rgba(255,255,255,0.05)",
                      borderColor: font === f ? `${mood.accent}50` : "rgba(255,255,255,0.1)",
                      color: font === f ? mood.textColor : "rgba(255,255,255,0.5)",
                    }}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-2">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>Line Height</p>
              <div className="flex gap-2">
                {(["normal", "relaxed", "loose"] as LineHeight[]).map((lh) => (
                  <button key={lh} onClick={() => setLineHeight(lh)}
                    className="flex-1 py-2.5 rounded-xl text-xs border transition-all"
                    style={{
                      background: lineHeight === lh ? `${mood.accent}20` : "rgba(255,255,255,0.05)",
                      borderColor: lineHeight === lh ? `${mood.accent}50` : "rgba(255,255,255,0.1)",
                      color: lineHeight === lh ? mood.textColor : "rgba(255,255,255,0.5)",
                      fontFamily: "var(--font-body)",
                    }}>
                    {lh === "normal" ? "Compact" : lh === "relaxed" ? "Normal" : "Loose"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
