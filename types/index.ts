export type Mood =
  | "melancholic"
  | "thrilling"
  | "romantic"
  | "humorous"
  | "mysterious"
  | "hopeful"
  | "dark"
  | "warm";

export interface MoodConfig {
  label: string;
  emoji: string;
  bg: string;
  accent: string;
  textColor: string;
}

export interface Scene {
  id: string;
  sceneNumber: number;
  text: string;
  bgClass: string; // tailwind background gradient class
  ambientEmoji: string; // decorative emoji shown faintly
  sceneImageUrl?: string; // 👈 SWAPPED: Replaced visualPrompt with optional uploaded asset string URL
}

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar: string; // initials fallback
  avatarColor: string;
  storiesCount: number;
  joinedDate: string;
}

export interface Story {
  id: string;
  title: string;
  tagline: string;
  author: Author;
  mood: Mood;
  scenes: Scene[];
  totalReadMinutes: number;
  publishedAt: string;
  featured: boolean;
  tags: string[];
}

export type StoryReaction = "like" | "dislike";

export interface StoryReactions {
  [storyId: string]: {
    likes: number;
    dislikes: number;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  avatarColor: string;
  joinedDate: string;
  bookmarks: string[]; // story ids
  completedStories: string[]; // story ids
  likedStories: string[]; // story ids
  dislikedStories: string[]; // story ids
  readingStreak: number;
  lastReadDate: string | null;
  longestStreak: number;
  moodPreferences: Mood[];
  totalStoriesRead: number;
}

export interface ReadingProgress {
  storyId: string;
  currentScene: number;
  completed: boolean;
  startedAt: string;
}