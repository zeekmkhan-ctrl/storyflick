import { TrendingUp } from "lucide-react";
import StoryCard from "@/components/home/StoryCard";
import MoodFilter from "@/components/home/MoodFilter";
import Navbar from "@/components/ui/Navbar";
import { client } from "@/lib/sanity";
// ⚡ ADDED import for Mood type to satisfy type casting
import { Story, Mood } from "@/types";

export const dynamic = "force-dynamic";

async function getStories(): Promise<Story[]> {
  const query = `*[_type == "story"] | order(_createdAt desc) {
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
      followers,
      storiesCount,
      joinedDate,
      "imageUrl": image.asset->url
    }
  }`;

  const data = await client.fetch<Story[]>(query, {}, { cache: "no-store" });
  if (!data || data.length === 0) {
    throw new Error("Sanity content lake returned no documents!");
  }
  return data;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ mood?: string }>;
}) {
  const resolvedParams = await searchParams;
  
  // ⚡ FIXED: Explicitly cast the incoming string parameter to the custom Mood type
  const selectedMood = (resolvedParams.mood as Mood) || null;
  
  const stories = await getStories();
  
  const featured = stories.filter((s) => s.featured);
  const filtered = selectedMood
    ? stories.filter((s) => s.mood === selectedMood)
    : stories;

  const now = new Date();
  const hour = now.getHours();
  const ambientLabel = hour >= 21 ? "Night" : hour >= 17 ? "Late evening" : hour >= 12 ? "Afternoon" : "Morning";
  const ambientMessage = hour >= 21 ? "A quiet story before sleep?" : hour >= 17 ? "Perfect weather for a story." : hour >= 12 ? "The world can wait. Read awhile." : "Slow mornings deserve gentle stories.";

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden bg-slate-950">
      <Navbar />

      <section className="relative w-full h-[38vh] flex flex-col justify-center items-start px-6 max-w-lg mx-auto border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent pt-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-slate-300 mb-2">
          <span>{ambientLabel}</span>
        </div>
        <h1 className="font-display text-4xl font-bold text-white tracking-tight leading-tight">
          Good {ambientLabel.toLowerCase()}, Reader
        </h1>
        <p className="font-body text-sm text-slate-400 mt-2 italic">
          "{ambientMessage}"
        </p>
      </section>

      <main className="relative z-10 pb-32 px-4 max-w-lg mx-auto mt-6 space-y-8">
        <div className="mb-2">
          <MoodFilter selected={selectedMood} onSelect={undefined} />
        </div>

        {/* Featured Section */}
        {!selectedMood && featured.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={13} className="text-amber-400" />
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Featured Works
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
              {featured.map((story, i) => (
                <div key={story.id} className="flex-shrink-0 w-[75vw] max-w-[260px]">
                  <StoryCard story={story} index={i} hideActions />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Regular Stream */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              {selectedMood ? `${selectedMood} Stories` : "All Anthologies"}
            </span>
            <span className="text-[10px] font-mono text-slate-500">{filtered.length} items</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filtered.map((story, i) => (
              <StoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}