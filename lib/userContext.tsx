"use client";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { UserProfile, StoryReaction } from "@/types";
import {
  getUser,
  saveUser,
  toggleBookmark as toggleBookmarkStorage,
  markStoryCompleted as markCompletedStorage,
  reactToStory as reactToStoryStorage,
} from "@/lib/storage";

interface UserContextType {
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  toggleBookmark: (storyId: string) => void;
  markCompleted: (storyId: string) => void;
  reactToStory: (storyId: string, reaction: StoryReaction) => void;
  isBookmarked: (storyId: string) => boolean;
  isCompleted: (storyId: string) => boolean;
  hasLiked: (storyId: string) => boolean;
  hasDisliked: (storyId: string) => boolean;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<UserProfile | null>(null);

  // Load persisted user after mount — getUser() is unavailable during SSR
  useEffect(() => {
    setUserState(getUser());
  }, []);

  const refreshUser = useCallback(() => {
    setUserState(getUser());
  }, []);

  const setUser = useCallback((u: UserProfile | null) => {
    if (u) saveUser(u);
    setUserState(u);
  }, []);

  const toggleBookmark = useCallback((storyId: string) => {
    const updated = toggleBookmarkStorage(storyId);
    if (updated) setUserState({ ...updated });
  }, []);

  const markCompleted = useCallback((storyId: string) => {
    const updated = markCompletedStorage(storyId);
    if (updated) setUserState({ ...updated });
  }, []);

  const reactToStory = useCallback((storyId: string, reaction: StoryReaction) => {
    const updated = reactToStoryStorage(storyId, reaction);
    if (updated) setUserState({ ...updated });
  }, []);

  const isBookmarked = useCallback(
    (storyId: string) => !!user?.bookmarks.includes(storyId),
    [user]
  );

  const isCompleted = useCallback(
    (storyId: string) => !!user?.completedStories.includes(storyId),
    [user]
  );

  const hasLiked = useCallback(
    (storyId: string) => !!user?.likedStories.includes(storyId),
    [user]
  );

  const hasDisliked = useCallback(
    (storyId: string) => !!user?.dislikedStories.includes(storyId),
    [user]
  );

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        toggleBookmark,
        markCompleted,
        reactToStory,
        isBookmarked,
        isCompleted,
        hasLiked,
        hasDisliked,
        refreshUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
