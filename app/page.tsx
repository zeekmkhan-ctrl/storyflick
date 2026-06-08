import { TrendingUp } from "lucide-react";
import Hero from "@/components/home/Hero";
import StoryCard from "@/components/home/StoryCard";
import MoodFilterWrapper from "@/components/home/MoodFilterWrapper";
import Navbar from "@/components/ui/Navbar";
import { client } from "@/lib/sanity";
import { Story, Mood } from "@/types";

export const revalidate = 60;

// ✅ Valid moods from schema (source of truth)
const validMoods: Mood[] = [
  "melancholic",
  "thrilling",
  "romantic",
  "humorous",
  "mysterious",
  "hopeful",
  "dark",
  "warm",
];

function isMood(value: string): value is Mood {
  return validMoods.includes(value as Mood);
}

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

  const data = await client.fetch<Story[]>(query);

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
  const params = await searchParams;
  const moodParam = params?.mood;

  // ✅ safe conversion (NO type assertion hacks)
  const selectedMood: Mood | null =
    moodParam && isMood(moodParam) ? moodParam : null;

  const stories = await getStories();

  const featured = stories.filter((s) => s.featured);

  const filtered = selectedMood
    ? stories.filter((s) => s.mood === selectedMood)
    : stories;

  const ctaFeaturedId = featured[0]?.id;
  const ctaFallbackId = stories[0]?.id;

  return (
    <HomePageClient
      ctaFeaturedId={ctaFeaturedId}
      ctaFallbackId={ctaFallbackId}
      featured={featured}
      selectedMood={selectedMood}
      filtered={filtered}
    />
  );
}

function HomePageClient({
  ctaFeaturedId,
  ctaFallbackId,
  featured,
  selectedMood,
  filtered,
}: {
  ctaFeaturedId?: string;
  ctaFallbackId?: string;
  featured: Story[];
  selectedMood: Mood | null;
  filtered: Story[];
}) {
  return (
    <div className="relative min-h-screen text-slate-100 overflow-x-hidden bg-slate-950">
      <Navbar />

      <Hero featuredStoryId={ctaFeaturedId} fallbackStoryId={ctaFallbackId} />

      {/* MAIN */}
      <main className="relative z-10 pb-32 px-4 max-w-lg mx-auto mt-6 space-y-8">
        
        {/* FILTER */}
        <MoodFilterWrapper selectedMood={selectedMood} />

        {/* FEATURED */}
        {!selectedMood && featured.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={13} className="text-amber-400" />
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Featured Works
              </span>
            </div>

            <div
              className="flex gap-3 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none" }}
            >
              {featured.map((story, i) => (
                <div
                  key={story.id}
                  className="flex-shrink-0 w-[75vw] max-w-[260px]"
                >
                  <StoryCard story={story} index={i} hideActions />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* STORIES */}
        <section id="stories" className="space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">
              {selectedMood ? `${selectedMood} Stories` : "All Anthologies"}
            </span>

            <span className="text-[10px] font-mono text-slate-500">
              {filtered.length} items
            </span>
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