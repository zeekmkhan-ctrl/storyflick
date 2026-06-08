"use client";
import { useState, useEffect } from "react";
import { Flame, BookOpen, Star, Award, LogOut, ChevronRight } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import Onboarding from "@/components/ui/Onboarding";
import { useUser } from "@/lib/userContext";
import { client } from "@/lib/sanity";
import { MOOD_CONFIG } from "@/lib/moods";
import { Mood, Story } from "@/types";
import Link from "next/link";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [completedStories, setCompletedStories] = useState<Story[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    async function fetchCompletedStories() {
      if (!user?.completedStories || user.completedStories.length === 0) {
        setCompletedStories([]);
        setLoadingHistory(false);
        return;
      }

      const query = `*[_type == "story" && id in $completedIds] {
        id,
        title,
        mood,
        author {
          name
        }
      }`;

      try {
        const data = await client.fetch<Story[]>(query, {
          completedIds: user.completedStories,
        });
        setCompletedStories(data || []);
      } catch (error) {
        console.error("Failed to fetch profile reading history from Sanity:", error);
      } finally {
        setLoadingHistory(false);
      }
    }

    setLoadingHistory(true);
    fetchCompletedStories();
  }, [user?.completedStories]);

  const joinDate = user ? new Date(user.joinedDate).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "";

  const stats = [
    { label: "Stories Read", value: user?.totalStoriesRead ?? 0, icon: BookOpen, color: "text-amber-400" },
    { label: "Day Streak", value: user?.readingStreak ?? 0, icon: Flame, color: "text-orange-400" },
    { label: "Best Streak", value: user?.longestStreak ?? 0, icon: Star, color: "text-sky-400" },
    { label: "Bookmarks", value: user?.bookmarks.length ?? 0, icon: Award, color: "text-emerald-400" },
  ];

  if (!ready) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <main className="pt-6 pb-24 px-4 max-w-lg mx-auto">
          <p className="text-xs text-slate-500 italic pt-6">Loading profile...</p>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <main className="pt-6 pb-24 px-4 max-w-lg mx-auto">
          <div className="text-center py-24">
            <div className="text-5xl mb-5">👤</div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Your reading profile</h2>
            <p className="font-body text-slate-400 text-sm mb-8">Track your streak, reading history and mood preferences.</p>
            <button
              onClick={() => setShowOnboarding(true)}
              className="px-8 py-3.5 rounded-full bg-[#FDFBF7] text-[#0b0d12] font-body font-semibold text-sm hover:bg-[#f0ebe0] transition-all active:scale-95"
            >
              Create Account
            </button>
          </div>
        </main>
        {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <main className="pt-6 pb-24 px-4 max-w-lg mx-auto">
        {/* Profile header */}
        <div className="pt-6 pb-6 flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
            style={{ backgroundColor: user.avatarColor }}
          >
            {user.avatar}
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-white">{user.name}</h1>
            <p className="font-body text-slate-400 text-xs mt-0.5">Reader since {joinDate}</p>
            {user.readingStreak > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-sm">🔥</span>
                <span className="text-xs font-body font-medium text-orange-400">
                  {user.readingStreak} day streak
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-slate-900 border border-white/10 rounded-2xl p-4">
              <Icon size={16} className={`${color} mb-2`} />
              <p className="font-display text-2xl font-bold text-white">{value}</p>
              <p className="font-body text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Mood preferences */}
        {user.moodPreferences.length > 0 && (
          <div className="mb-6">
            <h2 className="font-body text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">
              Your Moods
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.moodPreferences.map((mood) => {
                const config = MOOD_CONFIG[mood as Mood];
                if (!config) return null;
                return (
                  <span
                    key={mood}
                    className="text-xs font-body px-3 py-1.5 rounded-full border"
                    style={{
                      backgroundColor: `${config.accent}15`,
                      borderColor: `${config.accent}40`,
                      color: config.textColor,
                    }}
                  >
                    {config.emoji} {config.label}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Reading history */}
        {!loadingHistory && completedStories.length > 0 && (
          <div className="mb-6">
            <h2 className="font-body text-xs font-medium text-slate-400 uppercase tracking-widest mb-3">
              Completed Stories
            </h2>
            <div className="flex flex-col gap-2">
              {completedStories.map((story) => {
                const mood = MOOD_CONFIG[story.mood] || { emoji: "📖" };
                const authorName = story.author?.name ?? "Guest Contributor";
                return (
                  <Link
                    key={story.id}
                    href={`/read/${encodeURIComponent(story.id)}`}
                    className="flex items-center gap-3 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 hover:border-white/20 transition-all"
                  >
                    <span className="text-xl">{mood.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm font-semibold text-white truncate">{story.title}</p>
                      <p className="font-body text-xs text-slate-400">{authorName}</p>
                    </div>
                    <ChevronRight size={14} className="text-slate-600" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={() => {
            localStorage.clear();
            setUser(null);
          }}
          className="flex items-center gap-2 text-slate-500 text-sm font-body hover:text-slate-300 transition-colors mt-2"
        >
          <LogOut size={14} />
          <span>Sign out</span>
        </button>
      </main>
    </div>
  );
}