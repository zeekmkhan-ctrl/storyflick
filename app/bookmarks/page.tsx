"use client";
import React, { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import StoryCard from "@/components/home/StoryCard";
import { useUser } from "@/lib/userContext";
import { client } from "@/lib/sanity";
import { Story } from "@/types";

export default function BookmarksPage() {
  const { user } = useUser();
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarkedStories() {
      if (!user?.bookmarks || user.bookmarks.length === 0) {
        setSavedStories([]);
        setLoading(false);
        return;
      }

      // Fetch all stories from Sanity where the ID matches the user's bookmarks array
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
        const data = await client.fetch<Story[]>(query, { bookmarkIds: user.bookmarks }, { cache: "no-store" });
        setSavedStories(data || []);
      } catch (error) {
        console.error("Failed to fetch bookmarked stories from Sanity:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarkedStories();
  }, [user?.bookmarks]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="pt-24 pb-24 px-4 max-w-lg mx-auto">
        <div className="pt-6 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <Bookmark size={16} className="text-amber-400" />
            <h1 className="font-display text-xl font-bold text-white">Saved Stories</h1>
          </div>
          
          {loading ? (
            <p className="text-xs text-slate-500 italic mt-4">Loading bookmarks...</p>
          ) : (
            <p className="font-body text-slate-400 text-sm">
              {savedStories.length === 0 ? "Nothing saved yet" : `${savedStories.length} stories saved`}
            </p>
          )}
        </div>

        {!loading && savedStories.length > 0 && (
          <div className="grid grid-cols-1 gap-4 mt-2">
            {savedStories.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}