import { UserProfile, ReadingProgress, StoryReaction, StoryReactions } from "@/types";

const STORAGE_KEYS = {
  USER: "sf_user",
  PROGRESS: "sf_progress",
  ONBOARDED: "sf_onboarded",
  REACTIONS: "sf_reactions",
};

function isBrowser() {
  return typeof window !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeUser(raw: unknown): UserProfile {
  const r = isRecord(raw) ? raw : {};
  return {
    id: (typeof r.id === "string" && r.id) ? r.id : `user_${Date.now()}`,
    name: (typeof r.name === "string" && r.name) ? r.name : "Reader",
    email: typeof r.email === "string" ? r.email : "",
    avatar: (typeof r.avatar === "string" && r.avatar) ? r.avatar : "RD",
    avatarColor: (typeof r.avatarColor === "string" && r.avatarColor) ? r.avatarColor : "#3498db",
    joinedDate: typeof r.joinedDate === "string" ? r.joinedDate : new Date().toISOString(),
    bookmarks: Array.isArray(r.bookmarks) ? (r.bookmarks as string[]) : [],
    completedStories: Array.isArray(r.completedStories) ? (r.completedStories as string[]) : [],
    likedStories: Array.isArray(r.likedStories) ? (r.likedStories as string[]) : [],
    dislikedStories: Array.isArray(r.dislikedStories) ? (r.dislikedStories as string[]) : [],
    readingStreak: typeof r.readingStreak === "number" ? r.readingStreak : 0,
    lastReadDate: typeof r.lastReadDate === "string" ? r.lastReadDate : null,
    longestStreak: typeof r.longestStreak === "number" ? r.longestStreak : 0,
    moodPreferences: Array.isArray(r.moodPreferences) ? (r.moodPreferences as UserProfile["moodPreferences"]) : [],
    totalStoriesRead: typeof r.totalStoriesRead === "number" ? r.totalStoriesRead : 0,
  };
}

export function getUser(): UserProfile | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function saveUser(user: UserProfile): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

export function createUser(name: string, email: string): UserProfile {
  const colors = ["#3498db", "#e91e8c", "#e74c3c", "#10b981", "#8b5cf6", "#d97706"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const user: UserProfile = {
    id: `user_${Date.now()}`,
    name,
    email,
    avatar: initials,
    avatarColor: color,
    joinedDate: new Date().toISOString(),
    bookmarks: [],
    completedStories: [],
    likedStories: [],
    dislikedStories: [],
    readingStreak: 0,
    lastReadDate: null,
    longestStreak: 0,
    moodPreferences: [],
    totalStoriesRead: 0,
  };
  saveUser(user);
  return user;
}

export function toggleBookmark(storyId: string): UserProfile | null {
  const user = getUser();
  if (!user) return null;
  const idx = user.bookmarks.indexOf(storyId);
  if (idx > -1) {
    user.bookmarks.splice(idx, 1);
  } else {
    user.bookmarks.push(storyId);
  }
  saveUser(user);
  return user;
}

export function markStoryCompleted(storyId: string): UserProfile | null {
  const user = getUser();
  if (!user) return null;

  if (!user.completedStories.includes(storyId)) {
    user.completedStories.push(storyId);
    user.totalStoriesRead += 1;
  }

  const today = new Date().toDateString();
  const last = user.lastReadDate ? new Date(user.lastReadDate).toDateString() : null;
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (last === today) {
    // already read today — no change
  } else if (last === yesterday) {
    user.readingStreak += 1;
  } else {
    user.readingStreak = 1;
  }

  user.lastReadDate = new Date().toISOString();
  if (user.readingStreak > user.longestStreak) {
    user.longestStreak = user.readingStreak;
  }

  saveUser(user);
  return user;
}

export function getReactions(): StoryReactions {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REACTIONS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveReactions(reactions: StoryReactions): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.REACTIONS, JSON.stringify(reactions));
}

export function getStoryReaction(storyId: string): StoryReaction | null {
  const user = getUser();
  if (!user) return null;
  if (user.likedStories.includes(storyId)) return "like";
  if (user.dislikedStories.includes(storyId)) return "dislike";
  return null;
}

export function reactToStory(storyId: string, reaction: StoryReaction): UserProfile | null {
  const user = getUser();
  if (!user) return null;
  const reactions = getReactions();
  const currentReaction = getStoryReaction(storyId);
  const counts = reactions[storyId] ?? { likes: 0, dislikes: 0 };

  const removeReaction = (type: StoryReaction) => {
    if (type === "like") {
      user.likedStories = user.likedStories.filter((id) => id !== storyId);
      counts.likes = Math.max(0, counts.likes - 1);
    } else {
      user.dislikedStories = user.dislikedStories.filter((id) => id !== storyId);
      counts.dislikes = Math.max(0, counts.dislikes - 1);
    }
  };

  if (currentReaction === reaction) {
    removeReaction(reaction);
  } else {
    if (currentReaction) {
      removeReaction(currentReaction);
    }
    if (reaction === "like") {
      user.likedStories.push(storyId);
      counts.likes += 1;
    } else {
      user.dislikedStories.push(storyId);
      counts.dislikes += 1;
    }
  }

  if (counts.likes === 0 && counts.dislikes === 0) {
    delete reactions[storyId];
  } else {
    reactions[storyId] = counts;
  }

  saveUser(user);
  saveReactions(reactions);
  return user;
}

export function getProgress(): ReadingProgress[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveProgress(progress: ReadingProgress): void {
  if (!isBrowser()) return;
  const all = getProgress();
  const idx = all.findIndex((p) => p.storyId === progress.storyId);
  if (idx > -1) {
    all[idx] = progress;
  } else {
    all.push(progress);
  }
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(all));
}

export function getStoryProgress(storyId: string): ReadingProgress | null {
  return getProgress().find((p) => p.storyId === storyId) || null;
}

export function isOnboarded(): boolean {
  if (!isBrowser()) return false;
  return !!localStorage.getItem(STORAGE_KEYS.ONBOARDED);
}

export function setOnboarded(): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.ONBOARDED, "1");
}
