import SceneReader from "@/components/reader/SceneReader";
import { client } from "@/lib/sanity";
import { Story } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STORY_IDS_QUERY = `*[_type == "story"].id`;
export const revalidate = 60;

type RawScene = {
  id?: string;
  sceneNumber?: number;
  ambientEmoji?: string;
  bgClass?: string;
  text?: string;
  sceneImageUrl?: string | null;
  sceneImage?: { asset?: { url?: string | null } | null } | null;
  image?: { asset?: { url?: string | null } | null } | null;
  [key: string]: unknown;
};

type RawStory = Omit<Story, "scenes"> & {
  scenes?: RawScene[];
  [key: string]: unknown;
};

function normalizeStory(story: RawStory | null): any {
  if (!story) return null;

  const normalizedScenes = Array.isArray(story.scenes)
    ? story.scenes.map((scene: any, index: number) => {
        const imgUrl = scene?.sceneImageUrl ?? 
                       scene?.sceneImage?.asset?.url ?? 
                       scene?.image?.asset?.url ?? 
                       undefined;

        return {
          id: scene?.id ?? `scene-${index + 1}`,
          sceneNumber: scene?.sceneNumber ?? index + 1,
          bgClass: scene?.bgClass || "from-slate-900 via-blue-950 to-slate-900",
          ambientEmoji: scene?.ambientEmoji || "📖",
          text: scene?.text || "", 
          sceneImageUrl: imgUrl, 
        };
      })
    : [];

  return {
    ...story,
    // ⚡ FIX: Fallback structure protects your reader ui against blank/unlinked authors in Sanity
    author: story.author ?? {
      id: "unknown-author",
      name: "Guest Contributor",
      bio: "Storyflick contributor.",
      avatar: "S",
      avatarColor: "#b392ac"
    },
    scenes: normalizedScenes as any,
  };
}

async function getStory(storyId: string) {
  if (!storyId || typeof storyId !== 'string') {
    return null;
  }

  try {
    const query = `*[_type == "story" && id == $storyId][0] {
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
        avatarColor
      },
      scenes[] {
        id,
        sceneNumber,
        ambientEmoji,
        bgClass,
        text,
        "sceneImageUrl": sceneImage.asset->url
      }
    }`;

    const story = await client.fetch(query, { storyId });
    return normalizeStory(story);
  } catch (error) {
    console.error("Failed to fetch story:", error);
    return null;
  }
}

export async function generateStaticParams() {
  const ids = await client.fetch<string[]>(STORY_IDS_QUERY).catch(() => []);
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: PageProps) {
  const resolved = await params;
  const { id } = resolved;
  const story = await getStory(id);
  
  if (!story) return { title: "Story — Storyflick" };
  
  return {
    title: `${story.title} — Storyflick`,
    description: story.tagline,
  };
}

export default async function StoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const story = await getStory(resolvedParams.id);

  if (!story) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-5 text-center">
        <h1 className="text-xl font-semibold text-rose-400 mb-2">Story Not Found</h1>
        <p className="text-sm text-slate-400 max-w-sm">
          Could not find a story with ID "{resolvedParams.id}". Verify that this story is published in Sanity Studio and has matching field names.
        </p>
      </div>
    );
  }

  return <SceneReader story={story} />;
}