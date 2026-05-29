"use client";
import { Bookmark } from "lucide-react";
import Navbar from "@/components/ui/Navbar";
import StoryCard from "@/components/home/StoryCard";
import { useUser } from "@/lib/userContext";
import { STORIES } from "@/data/stories";

export default function BookmarksPage() {
  const { user } = useUser();
  const saved = STORIES.filter((s) => user?.bookmarks.includes(s.id));

  return (
    <div className="min-h-screen bg-ink-950">
      <Navbar />
      <main className="pt-16 pb-24 px-4 max-w-lg mx-auto">
        <div className="pt-6 pb-5">
          <div className="flex items-center gap-2 mb-1">
            <Bookmark size={16} className="text-gold-400" />
            <h1 className="font-display text-xl font-bold text-white">Saved Stories</h1>
          </div>
          <p className="font-body text-ink-400 text-sm">
            {saved.length === 0 ? "Nothing saved yet" : `${saved.length} stories saved`}
          </p>
        </div>

        {!user ? (
          <div className="text-center py-20 text-ink-500">
            <p className="text-4xl mb-4">🔒</p>
            <p className="font-body text-sm mb-1">Create an account to save stories</p>
            <p className="font-body text-xs text-ink-600">Your bookmarks will appear here</p>
          </div>
        ) : saved.length === 0 ? (
          <div className="text-center py-20 text-ink-500">
            <p className="text-4xl mb-4">📑</p>
            <p className="font-body text-sm">Bookmark a story to find it here</p>
            <p className="font-body text-xs text-ink-600 mt-1">Tap the bookmark icon on any story card</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {saved.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
