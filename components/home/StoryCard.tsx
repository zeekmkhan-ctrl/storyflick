"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Clock, Bookmark, BookmarkCheck, ThumbsUp, ThumbsDown, ArrowRight } from "lucide-react";
import { Story } from "@/types";
import { MOOD_CONFIG } from "@/lib/moods";
import { useUser } from "@/lib/userContext";
import { getReactions } from "@/lib/storage";

interface StoryCardProps {
  story: Story;
  index?: number;
  hideActions?: boolean;
}

export default function StoryCard({ story, index = 0, hideActions = false }: StoryCardProps) {
  // ⚡ Component lifecycle state to safely track client-side mounting
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    user,
    toggleBookmark,
    isBookmarked,
    isCompleted,
    reactToStory,
    hasLiked,
    hasDisliked,
  } = useUser();

  const mood = MOOD_CONFIG[story.mood] || { emoji: "📖", label: "Story", accent: "#94a3b8" };
  const bookmarked = isBookmarked(story.id);
  const completed = isCompleted(story.id);
  const liked = hasLiked(story.id);
  const disliked = hasDisliked(story.id);
  const reactions = getReactions();
  const storyCounts = reactions[story.id] ?? { likes: 0, dislikes: 0 };
  const totalVotes = storyCounts.likes + storyCounts.dislikes;
  const approvalLabel = totalVotes
    ? `${Math.round((storyCounts.likes / totalVotes) * 100)}% approval`
    : "New";
  const showNewBadge = hideActions && approvalLabel === "New";

  // Safe variables fallback map if author details are left unpopulated in Sanity
  const authorName = story.author?.name ?? "Guest Contributor";
  const authorAvatar = story.author?.avatar ?? "G";
  const authorColor = story.author?.avatarColor ?? "#4a5568";

  const isLastMonsoon = story.id === "the-last-monsoon";
  const outerCardClasses = `relative overflow-hidden rounded-[28px] border border-white/10 bg-white/10 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] ${isLastMonsoon ? "backdrop-blur-md bg-white/[0.03] border-white/[0.05]" : "backdrop-blur-xl"} ${hideActions ? "min-h-[190px]" : "min-h-[280px]"} transition-transform duration-300 hover:-translate-y-0.5 flex flex-col`;

  return (
    <div
      className="relative group animate-fade-up"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both", opacity: 0 }}
    >
      <div className={outerCardClasses}>
        {/* Ambient lighting overlays */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.16),_transparent_26%)] opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/5" />
        
        {/* BLOCK 1: Title & Description */}
        <div className={`relative ${hideActions ? "p-5 pb-2" : "p-6 pb-2"} flex-1 flex flex-col justify-between`}>
          <div className={`flex items-center ${hideActions ? "flex-nowrap gap-5" : "flex-wrap justify-between gap-3"} mb-4`}>
            <div className={`inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 ${hideActions ? "px-2.5 py-1 text-[10px]" : "px-3 py-1.5 text-[11px]"} uppercase tracking-[0.22em] text-slate-300`}>
              <span>{mood.emoji}</span>
              <span style={{ color: mood.accent }}>{mood.label}</span>
            </div>
            <div className={`flex items-center gap-2 ${hideActions ? "flex-nowrap" : ""}`}>
              
              {/* ⚡ FIX: Added `mounted` condition block layer check to protect badge layout boundaries */}
              {!hideActions && mounted && completed && (
                <span
                  className="inline-flex items-center justify-center h-7 w-7 shrink-0 rounded-full border border-gold-300/25 bg-gold-500/20 text-gold-300"
                  title="Completed"
                  aria-label="Completed"
                >
                  <Check size={14} />
                </span>
              )}

              {showNewBadge ? (
                <div className={`inline-flex items-center gap-1 rounded-full ${hideActions ? "px-2 py-0.5 text-[8px]" : "px-3 py-1 text-[10px]"} uppercase tracking-[0.18em] bg-gold-500 text-ink-950 font-semibold`}>
                  <span>New</span>
                  <ArrowRight size={10} />
                </div>
              ) : totalVotes > 0 ? (
                <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 ${hideActions ? "px-2.5 py-1 text-[9px]" : "px-3 py-1 text-[10px]"} uppercase tracking-[0.24em] text-slate-400`}>
                  {approvalLabel}
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-auto">
            <h2 className={`font-display ${hideActions ? "text-2xl" : "text-3xl"} font-semibold text-slate-100 leading-tight mb-3`}>
              {story.title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
              {story.tagline}
            </p>
          </div>

          {/* Master link handler covering text area */}
          <Link href={`/read/${encodeURIComponent(story.id)}`} className="absolute inset-0 z-10" aria-label={`Read ${story.title}`} />
        </div>

        {/* BLOCK 2: UI-Polished Interactive Footer */}
        <div className={`relative z-20 ${hideActions ? "px-5 pb-5" : "px-6 pb-6"} pt-2 mt-auto flex flex-col gap-4`}>
          <div className="flex items-center justify-between gap-4 text-slate-400">
            
            {!hideActions ? (
              <Link
                href={`/author/${story.author?.id ?? "unknown"}`}
                className="flex items-center gap-3 min-w-0 group/author hover:opacity-80 transition relative z-30"
              >
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-3xl text-sm font-semibold text-white transition-transform group-hover/author:scale-105-shrink-0"
                  style={{ backgroundColor: authorColor }}
                >
                  {authorAvatar}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-100 truncate group-hover/author:text-amber-200 transition-colors">
                    {authorName}
                  </p>
                  <p className="text-xs text-slate-500">Author</p>
                </div>
              </Link>
            ) : <div />}
            
            <div className="flex items-center gap-2 text-xs">
              <Clock size={14} />
              <span>{story.totalReadMinutes} min</span>
            </div>
          </div>

          {!hideActions && (
            <div className="flex flex-wrap items-center gap-3 relative z-30">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  reactToStory(story.id, "like");
                }}
                disabled={!user || false}
                suppressHydrationWarning
                className={`min-w-[110px] flex-1 inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                  user
                    ? liked
                      ? "border-amber-300 bg-amber-500/15 text-amber-200"
                      : "border-white/10 bg-white/5 text-slate-100 hover:border-white/20 hover:bg-white/10"
                    : "cursor-not-allowed border-white/10 bg-white/5 text-slate-500"
                }`}
              >
                <ThumbsUp size={14} />
                {storyCounts.likes}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  reactToStory(story.id, "dislike");
                }}
                disabled={!user || false}
                suppressHydrationWarning
                className={`min-w-[110px] flex-1 inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                  user
                    ? disliked
                      ? "border-rose-300 bg-rose-500/15 text-rose-200"
                      : "border-white/10 bg-white/5 text-slate-100 hover:border-white/20 hover:bg-white/10"
                    : "cursor-not-allowed border-white/10 bg-white/5 text-slate-500"
                }`}
              >
                <ThumbsDown size={14} />
                {storyCounts.dislikes}
              </button>

              {mounted && user && (
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={(e) => {
                    e.preventDefault();
                    toggleBookmark(story.id);
                  }}
                  className="inline-flex h-10 min-w-[44px] items-center justify-center flex-shrink-0 rounded-full border border-white/10 bg-white/5 text-slate-100 transition hover:bg-white/10"
                >
                  {bookmarked ? (
                    <BookmarkCheck size={18} className="text-amber-300" />
                  ) : (
                    <Bookmark size={18} className="text-slate-200" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
  }