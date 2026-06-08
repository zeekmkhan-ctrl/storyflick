"use client";
import React, { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import StoryCard from "@/components/home/StoryCard";
import Onboarding from "@/components/ui/Onboarding";
import { useUser } from "@/lib/userContext";
import { client } from "@/lib/sanity";
import { Story } from "@/types";

export default function BookmarksPage() {
  const { user } = useUser();
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function fetchBookmarkedStories() {
      if (!user) {
        setSavedStories([]);
        setLoading(false);
        return;
      }

      if (user.bookmarks.length === 0) {
        setSavedStories([]);
        setLoading(false);
        return;
      }

      const query = `*[_type == "story" && id in $bookmarkIds] | order(_createdAt desc) {
        id,
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
          "imageUrl": image.asset->url
        }
      }`;

      try {
        const data = await client.fetch<Story[]>(query, {
          bookmarkIds: user.bookmarks,
        });
        setSavedStories(data || []);
      } catch (error) {
        console.error("Failed to fetch bookmarked stories from Sanity:", error);
      } finally {
        setLoading(false);
      }
    }

    setLoading(true);
    fetchBookmarkedStories();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="pt-6 pb-24 px-4 max-w-lg mx-auto">
        <div className="pt-6 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <Bookmark size={16} className="text-amber-400" />
            <h1 className="font-display text-xl font-bold text-white">Saved Stories</h1>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 italic mt-4">Loading bookmarks...</p>
          ) : !user ? (
            <div className="mt-6 text-center py-12">
              <p className="font-body text-slate-400 text-sm mb-6">
                Create a profile to save stories and find them here.
              </p>
              <button
                onClick={() => setShowOnboarding(true)}
                className="px-6 py-3 rounded-full bg-[#FDFBF7] text-[#0b0d12] text-sm font-medium hover:bg-[#f0ebe0] transition-colors"
              >
                Start Reading
              </button>
            </div>
          ) : (
            <>
              <p className="font-body text-slate-400 text-sm">
                {savedStories.length === 0
                  ? "Nothing saved yet — tap the bookmark icon on any story."
                  : `${savedStories.length} stories saved`}
              </p>

              {savedStories.length > 0 && (
                <div className="grid grid-cols-1 gap-4 mt-6">
                  {savedStories.map((story, i) => (
                    <StoryCard key={story.id} story={story} index={i} />
                  ))}
                </div>
              )}

              {savedStories.length === 0 && (
                <Link
                  href="/"
                  className="inline-block mt-6 text-sm text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Browse stories →
                </Link>
              )}
            </>
          )}
        </div>
      </main>
      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
    </div>
  );
}
