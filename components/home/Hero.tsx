"use client";

import Link from "next/link";
import { useUser } from "@/lib/userContext";
import { getProgress } from "@/lib/storage";
import {
  getTimeChip,
  getTagline,
  getHeadline,
  getCtaLabel,
} from "@/lib/heroContent";

interface HeroProps {
  featuredStoryId?: string;
  fallbackStoryId?: string;
}

function resolveCtaStoryId(
  hasStreak: boolean,
  featuredStoryId?: string,
  fallbackStoryId?: string
): string | undefined {
  if (hasStreak) {
    const inProgress = getProgress()
      .filter((p) => !p.completed)
      .sort(
        (a, b) =>
          new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
      );
    if (inProgress[0]) return inProgress[0].storyId;
  }
  return featuredStoryId ?? fallbackStoryId;
}

export default function Hero({ featuredStoryId, fallbackStoryId }: HeroProps) {
  const { user } = useUser();
  const now = new Date();

  const firstName = user?.name?.split(" ")[0] || "Reader";
  const chip = getTimeChip(now.getHours());
  const headline = getHeadline(firstName, now);
  const tagline = getTagline(now);
  const hasStreak = (user?.readingStreak ?? 0) > 0;
  const ctaLabel = getCtaLabel(hasStreak);
  const ctaStoryId = resolveCtaStoryId(
    hasStreak,
    featuredStoryId,
    fallbackStoryId
  );

  const ctaClassName =
    "relative z-10 mt-5 w-fit inline-flex items-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors bg-[#FDFBF7] text-[#0b0d12] hover:bg-[#f0ebe0]";

  return (
    <section className="relative w-full h-[40vh] min-h-[300px] flex flex-col justify-center items-start px-6 max-w-lg mx-auto border-b border-white/5 pt-20">
      <img
        src="/hero-window.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/40 to-slate-950/20" />

      <div className="relative z-10 w-fit inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-300 mb-3">
        <span>{chip}</span>
      </div>

      <h1 className="relative z-10 font-display text-4xl font-bold text-white tracking-tight leading-tight">
        {headline}
      </h1>

      <p className="relative z-10 font-body text-sm text-slate-400 mt-2 italic">
        &ldquo;{tagline}&rdquo;
      </p>

      {ctaStoryId ? (
        <Link href={`/read/${ctaStoryId}`} className={ctaClassName}>
          {ctaLabel}
        </Link>
      ) : (
        <a href="#stories" className={ctaClassName}>
          {ctaLabel}
        </a>
      )}
    </section>
  );
}
