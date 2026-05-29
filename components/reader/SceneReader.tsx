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
type ThemeChoice = "paper" | "sepia" | "dark";
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

const THEMES: Record<ThemeChoice, { bg: string; text: string; subtext: string; card: string; border: string; rule: string }> = {
  paper: {
    bg:      "#f5f0e8",
    text:    "#2c1f0e",
    subtext: "#8b7355",
    card:    "#faf6ee",
    border:  "rgba(139,115,85,0.25)",
    rule:    "rgba(139,115,85,0.18)",
  },
  sepia: {
    bg:      "#e8dcc8",
    text:    "#3d2b1f",
    subtext: "#7a5c3a",
    card:    "#f0e8d8",
    border:  "rgba(120,90,50,0.25)",
    rule:    "rgba(120,90,50,0.18)",
  },
  dark: {
    bg:      "#141414",
    text:    "#e8e0d0",
    subtext: "#8a8070",
    card:    "#1c1c1c",
    border:  "rgba(255,255,255,0.06)",
    rule:    "rgba(255,255,255,0.05)",
  },
};

const LINE_HEIGHTS: Record<LineHeight, string> = {
  normal:  "1.75",
  relaxed: "2",
  loose:   "2.3",
};

export default function SceneReader({ story }: SceneReaderProps) {
  const router = useRouter();
  const { user, toggleBookmark, markCompleted, isBookmarked } = useUser();

  const [currentScene, setCurrentScene]   = useState(0);
  const [animKey, setAnimKey]             = useState(0);
  const [pageDirection, setPageDirection] = useState<"next" | "prev">("next");
  const [isTurning, setIsTurning]         = useState(false);
  const [turnFromScene, setTurnFromScene] = useState(0);
  const [targetScene, setTargetScene]     = useState<number | null>(null);
  const [showComplete, setShowComplete]   = useState(false);
  const [showSceneList, setShowSceneList] = useState(false);
  const [showSettings, setShowSettings]   = useState(false);
  const [bookmarkFlash, setBookmarkFlash] = useState(false);

  // Reading settings
  const [fontSize, setFontSize]     = useState(16);
  const [font, setFont]             = useState<FontChoice>("playfair");
  const [theme, setTheme]           = useState<ThemeChoice>("paper");
  const [lineHeight, setLineHeight] = useState<LineHeight>("relaxed");

  // Touch / swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDiff, setTouchDiff]   = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const turnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mood        = MOOD_CONFIG[story.mood];
  const scene       = story.scenes[currentScene];
  const totalScenes = story.scenes.length;
  const bookmarked  = isBookmarked(story.id);
  const pct         = Math.round(((currentScene + 1) / totalScenes) * 100);
  const th          = THEMES[theme];
  const ambient     = AMBIENT[story.id] ?? { icon: "📖", label: "" };

  useEffect(() => {
    saveProgress({ storyId: story.id, currentScene, completed: currentScene === totalScenes - 1, startedAt: new Date().toISOString() });
  }, [story.id, currentScene, totalScenes]);

  useEffect(() => {
    return () => {
      if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    };
  }, []);

  const getSceneImageUrl = (s: Scene) => {
    if (s.sceneImageUrl) return s.sceneImageUrl;
    const maybe = s as Scene & { sceneImage?: { asset?: { url?: string } } };
    return maybe.sceneImage?.asset?.url ?? "";
  };

  const startPageTurn = useCallback((nextIndex: number, direction: "next" | "prev") => {
    if (isTurning || nextIndex < 0 || nextIndex >= totalScenes || nextIndex === currentScene) return;
    setPageDirection(direction);
    setTurnFromScene(currentScene);
    setTargetScene(nextIndex);
    setIsTurning(true);
    setTouchDiff(0);
    if (turnTimerRef.current) clearTimeout(turnTimerRef.current);
    turnTimerRef.current = setTimeout(() => {
      setCurrentScene(nextIndex);
      setAnimKey(k => k + 1);
      setIsTurning(false);
      setTargetScene(null);
      cardRef.current?.scrollTo({ top: 0, behavior: "auto" });
    }, 700);
  }, [isTurning, totalScenes, currentScene]);

  const goNext = useCallback(() => {
    if (currentScene < totalScenes - 1) {
      startPageTurn(currentScene + 1, "next");
    } else {
      setShowComplete(true);
      if (user) markCompleted(story.id);
    }
  }, [currentScene, totalScenes, user, markCompleted, story.id, startPageTurn]);

  const goPrev = useCallback(() => {
    if (currentScene > 0) {
      startPageTurn(currentScene - 1, "prev");
    }
  }, [currentScene, startPageTurn]);

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
  const handleTouchMove  = (e: React.TouchEvent) => { if (touchStart !== null) setTouchDiff(e.touches[0].clientX - touchStart); };
  const handleTouchEnd   = () => { if (Math.abs(touchDiff) > 60) { if (touchDiff < 0) goNext(); else goPrev(); } setTouchStart(null); setTouchDiff(0); };

  const renderSceneCard = (sc: Scene, scIndex: number, attachScrollRef = false) => {
    const sceneImageUrl = getSceneImageUrl(sc);
    return (
      <>
        <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, transparent, ${mood.accent}60, transparent)` }} />
        <div ref={attachScrollRef ? cardRef : undefined} className="px-7 pt-6 pb-8 flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1" style={{ background: th.rule }} />
            <span className="text-[9px] tracking-[0.18em] uppercase font-mono" style={{ color: th.subtext }}>
              Scene {sc.sceneNumber}
            </span>
            <div className="h-px flex-1" style={{ background: th.rule }} />
          </div>

          {sceneImageUrl && (
            <div className="mb-5">
              <img
                src={sceneImageUrl}
                alt="Scene illustration"
                className="w-full h-56 sm:h-64 object-cover rounded-2xl shadow-xl"
                loading="eager"
                style={{ filter: theme === "dark" ? "brightness(0.95) contrast(1.05)" : "none" }}
              />
            </div>
          )}

          {sc.text.split("\n\n").map((para, i) => (
            <p key={i} className="mb-5 last:mb-0"
              style={{
                fontFamily: FONTS[font],
                fontSize: `${fontSize}px`,
                lineHeight: LINE_HEIGHTS[lineHeight],
                color: th.text,
                textAlign: "left",
              }}>
              {para}
            </p>
          ))}

          <div className="mt-7 pt-5 flex items-center gap-2.5" style={{ borderTop: `1px solid ${th.rule}` }}>
            {/* ⚡ FIX 1: Safe Optional Chaining protection added to footer avatar row */}
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0"
              style={{ backgroundColor: story.author?.avatarColor || "#4a5568" }}>
              {story.author?.avatar || "?"}
            </div>
            <span className="text-[11px] italic" style={{ color: th.subtext, fontFamily: FONTS[font] }}>
              {story.author?.name || "Guest Contributor"}
            </span>
            <div className="ml-auto flex gap-1.5">
              {story.scenes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (i === scIndex) return;
                    startPageTurn(i, i > scIndex ? "next" : "prev");
                  }}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === scIndex ? "18px" : "6px",
                    height: "6px",
                    background: i === scIndex ? th.subtext : th.rule,
                    opacity: i === scIndex ? 1 : 0.5,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

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
          {/* ⚡ FIX 2: Optional Chaining fallback for closing template card info context */}
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
            <button onClick={() => { setShowComplete(false); setCurrentScene(0); setAnimKey(k => k + 1); }}
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
    <div className="fixed inset-0 overflow-hidden flex flex-col"
      style={{ background: "#0a0a10" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}>

      {/* ── LAYER 1: Atmospheric Background ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className={`absolute inset-0 bg-gradient-to-br ${scene.bgClass}`} style={{ transition: "all 1.2s ease", opacity: 0.7 }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.9) 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 h-80" style={{ background: "linear-gradient(to top, rgba(10,10,16,1) 0%, rgba(10,10,16,0.7) 50%, transparent 100%)" }} />
        <div className="absolute top-0 left-0 right-0 h-36" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.75) 0%, transparent 100%)" }} />
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <span className="select-none" style={{ fontSize: "clamp(160px,45vw,280px)", opacity: 0.02, filter: "blur(2px)", transform: "translateY(10%)" }}>
            {scene.ambientEmoji}
          </span>
        </div>
      </div>

      {/* ── LAYER 2: Top header toolbars ── */}
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
              {/* ⚡ FIX 3: Optional Chaining protection added to running top layout title wrapper info */}
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

      {/* ── LAYER 3: Reading parchment viewport layout ── */}
      <div className="relative flex-1 overflow-hidden px-4 py-3" style={{ zIndex: 10, scrollbarWidth: "none" }}>
        {bookmarkFlash && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium border"
            style={{ background: "rgba(0,0,0,0.7)", borderColor: `${mood.accent}50`, color: mood.textColor, backdropFilter: "blur(12px)", fontFamily: "var(--font-body)", animation: "fadeUp .3s ease forwards" }}>
            <BookmarkCheck size={13} /> {bookmarked ? "Bookmarked" : "Removed"}
          </div>
        )}

        <div key={animKey} className="relative rounded-3xl overflow-hidden shadow-2xl h-[76vh]" style={{ perspective: "1900px" }}>
          {isTurning && targetScene !== null ? (
            <>
              <div
                className="absolute inset-0 rounded-3xl overflow-hidden flex flex-col"
                style={{
                  background: th.card,
                  border: `1px solid ${th.border}`,
                  backgroundImage: theme !== "dark"
                    ? "repeating-linear-gradient(0deg,transparent,transparent 31px,rgba(139,115,85,0.055) 32px)"
                    : "none",
                  animation: "pageUnderReveal .7s ease forwards",
                }}
              >
                {renderSceneCard(story.scenes[targetScene], targetScene, false)}
              </div>
              <div
                className="absolute inset-0 rounded-3xl overflow-hidden flex flex-col"
                style={{
                  background: th.card,
                  border: `1px solid ${th.border}`,
                  backgroundImage: theme !== "dark"
                    ? "repeating-linear-gradient(0deg,transparent,transparent 31px,rgba(139,115,85,0.055) 32px)"
                    : "none",
                  transformOrigin: pageDirection === "next" ? "left center" : "right center",
                  animation: pageDirection === "next" ? "pageTurnOutNext .7s cubic-bezier(0.28,0.84,0.42,1) forwards" : "pageTurnOutPrev .7s cubic-bezier(0.28,0.84,0.42,1) forwards",
                  willChange: "transform, opacity, filter",
                  backfaceVisibility: "hidden",
                }}
              >
                {renderSceneCard(story.scenes[turnFromScene], turnFromScene, true)}
              </div>
            </>
          ) : (
            <div
              className="absolute inset-0 rounded-3xl overflow-hidden flex flex-col"
              style={{
                background: th.card,
                border: `1px solid ${th.border}`,
                backgroundImage: theme !== "dark"
                  ? "repeating-linear-gradient(0deg,transparent,transparent 31px,rgba(139,115,85,0.055) 32px)"
                  : "none",
              }}
            >
              {renderSceneCard(scene, currentScene, true)}
            </div>
          )}
          <div className="absolute bottom-[72px] right-4 w-7 h-7"
            style={{ background: `linear-gradient(225deg, ${th.border} 50%, transparent 50%)`, borderRadius: "0 0 8px 0" }} />
        </div>

        <div className="h-6" />
      </div>

      {/* ── LAYER 4: Bottom controls ── */}
      <div className="relative flex-shrink-0" style={{ zIndex: 10, paddingBottom: "env(safe-area-inset-bottom)", background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 70%, transparent 100%)" }}>
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center gap-3">
            <button onClick={goPrev} disabled={currentScene === 0 || isTurning}
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

            <button onClick={goNext} disabled={isTurning}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={{ background: mood.accent, color: "#07070f", fontFamily: "var(--font-body)" }}>
              <span>{currentScene === totalScenes - 1 ? "Finish" : "Next Scene"}</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── OVERLAY SECTIONS: Slidable indexes ── */}
      {showSceneList && (
        <div className="absolute inset-0 flex items-end" style={{ zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowSceneList(false)}>
          <div className="w-full rounded-t-3xl p-5" style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>All Scenes</h3>
              <button onClick={() => setShowSceneList(false)} className="text-white/40 hover:text-white/70"><X size={18} /></button>
            </div>
            <div className="flex flex-col gap-1 mb-4">
              {story.scenes.map((sc, i) => (
                <button key={i} onClick={() => { setCurrentScene(i); setAnimKey(k => k + 1); setShowSceneList(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all"
                  style={{ background: i === currentScene ? `${mood.accent}15` : "transparent", border: `1px solid ${i === currentScene ? `${mood.accent}30` : "transparent"}` }}>
                  <span className="text-xs font-mono w-4 flex-shrink-0" style={{ color: i === currentScene ? mood.textColor : "rgba(255,255,255,0.3)" }}>{i + 1}</span>
                  <span className="text-sm flex-1 truncate" style={{ color: i === currentScene ? "#fff" : "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>
                    {sc.text || `Scene ${i + 1}`}
                  </span>
                  {i === currentScene && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: mood.accent }} />}
                  {i < currentScene && <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />}
                </button>
              ))}
            </div>
            <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-body)" }}>
              You are on scene {currentScene + 1} of {totalScenes}
            </p>
          </div>
        </div>
      )}

      {/* ── OVERLAY SECTIONS: Settings ── */}
      {showSettings && (
        <div className="absolute inset-0 flex items-end" style={{ zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowSettings(false)}>
          <div className="w-full rounded-t-3xl p-5" style={{ background: "#18181f", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Reading Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-white/40 hover:text-white/70"><X size={18} /></button>
            </div>

            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>Text Size</p>
              <div className="flex items-center gap-3">
                <button onClick={() => setFontSize(s => Math.max(13, s - 1))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                  <Minus size={14} className="text-white/60" />
                </button>
                <span className="flex-1 text-center text-white text-sm" style={{ fontFamily: "var(--font-body)" }}>A — {fontSize}px</span>
                <button onClick={() => setFontSize(s => Math.min(22, s + 1))}
                  className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{ background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)" }}>
                  <Plus size={14} className="text-white/60" />
                </button>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>Font</p>
              <div className="flex gap-2">
                {(["playfair", "lora", "merriweather"] as FontChoice[]).map(f => (
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

            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>Theme</p>
              <div className="flex gap-2">
                {([["paper", "#f5f0e8"], ["sepia", "#e8dcc8"], ["dark", "#1c1c1c"]] as [ThemeChoice, string][]).map(([t, bg]) => (
                  <button key={t} onClick={() => setTheme(t)}
                    className="flex-1 py-2.5 rounded-xl text-xs border transition-all"
                    style={{
                      background: bg,
                      borderColor: theme === t ? mood.accent : "rgba(255,255,255,0.1)",
                      color: t === "dark" ? "rgba(255,255,255,0.7)" : "#3d2b1f",
                      fontFamily: "var(--font-body)",
                      boxShadow: theme === t ? `0 0 0 2px ${mood.accent}40` : "none",
                    }}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-body)" }}>Line Height</p>
              <div className="flex gap-2">
                {(["normal", "relaxed", "loose"] as LineHeight[]).map(lh => (
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
        @keyframes pageTurnOutNext {
          0% {
            opacity: 1;
            transform: perspective(1800px) rotateY(0deg) translateX(0) scale(1);
            filter: brightness(1);
          }
          100% {
            opacity: 0.38;
            transform: perspective(1800px) rotateY(-82deg) translateX(-10px) scale(0.985);
            filter: brightness(0.86);
          }
        }
        @keyframes pageTurnOutPrev {
          0% {
            opacity: 1;
            transform: perspective(1800px) rotateY(0deg) translateX(0) scale(1);
            filter: brightness(1);
          }
          100% {
            opacity: 0.38;
            transform: perspective(1800px) rotateY(82deg) translateX(10px) scale(0.985);
            filter: brightness(0.86);
          }
        }
        @keyframes pageUnderReveal {
          0% {
            opacity: 0.84;
            transform: scale(0.988);
            filter: brightness(0.93);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: brightness(1);
          }
        }
        @keyframes fadeUp {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}