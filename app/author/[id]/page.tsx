"use client";
import { use, useEffect, useState } from "react";
import { Heart, Users, BookOpen, Clock } from "lucide-react";
import Link from "next/link";
import { client } from "@/lib/sanity";
import Navbar from "@/components/ui/Navbar";
import { MOOD_CONFIG } from "@/lib/moods";
import type { Story } from "@/types";

interface AuthorData {
  id: string;
  name: string;
  avatar: string;
  avatarColor: string;
  bio: string;
  imageUrl?: string;
  followers: number;
}

export default function AuthorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  const [author, setAuthor] = useState<AuthorData | null>(null);
  const [stories, setStories] = useState<Array<Pick<Story, "id" | "title" | "tagline" | "mood" | "totalReadMinutes" | "publishedAt" | "tags"> & { author: AuthorData }>>([]);
  const [loading, setLoading] = useState(true);
  const [upvotes, setUpvotes] = useState(0);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  useEffect(() => {
    async function getAuthorData() {
      try {
        const query = `*[_type == "story" && author.id == $id] | order(_createdAt desc) {
          "id": id,
          title,
          tagline,
          mood,
          author {
            id,
            name,
            bio,
            avatar,
            avatarColor,
            followers,
            "imageUrl": image.asset->url
          },
          totalReadMinutes,
          publishedAt,
          tags
        }`;

        const fetchedStories = await client.fetch(query, { id });
        
        if (fetchedStories.length > 0) {
          const authorInfo = fetchedStories[0].author;
          setAuthor(authorInfo);
          setStories(fetchedStories);
          setUpvotes(Math.floor((authorInfo.followers || 0) * 1.4) + 12);
        }
      } catch (error) {
        console.error("Error fetching author details:", error);
      } finally {
        setLoading(false);
      }
    }

    getAuthorData();
  }, [id]);

  const handleUpvote = () => {
    if (hasUpvoted) {
      setUpvotes(prev => prev - 1);
      setHasUpvoted(false);
    } else {
      setUpvotes(prev => prev + 1);
      setHasUpvoted(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 font-body text-xs tracking-widest uppercase animate-pulse">Loading Identity...</p>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 font-body text-sm">Creator index not populated.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500/20 pb-28 flex flex-col justify-start items-center">
      <Navbar />
      
      {/* UPDATED MAIN TAG:
        - Changed pt-24 to pt-12 to lift it directly up near the Navbar boundary
        - Added mt-14 to smoothly prevent any absolute overlap with the header text
        - Replaced flex centering with a clean block layout flow
      */}
      <main className="mt-14 pt-12 px-4 max-w-md w-full mx-auto block space-y-6">
        
        {/* Seamless Profile Card */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent p-6 shadow-xl">
          
          <div className="flex items-center gap-4 mb-4">
            {author.imageUrl ? (
              <img 
                src={author.imageUrl} 
                alt={author.name}
                className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-inner flex-shrink-0"
              />
            ) : (
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0"
                style={{ backgroundColor: author.avatarColor }}
              >
                {author.avatar}
              </div>
            )}

            <div className="min-w-0">
              <h1 className="font-display text-xl font-bold text-white tracking-tight">
                {author.name}
              </h1>
              <p className="text-[10px] text-amber-400 font-body uppercase tracking-wider mt-0.5 flex items-center gap-1">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                Verified Storyflick Creator
              </p>
            </div>
          </div>

          <p className="font-body text-xs text-slate-400 leading-relaxed mb-6">
            {author.bio || "This dynamic storyteller hasn't added a biography manifesto yet."}
          </p>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 border-t border-white/5 pt-4 gap-2 text-center">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.01]">
              <Users size={14} className="text-slate-500 mb-0.5" />
              <span className="text-xs font-bold text-slate-200">{author.followers || 0}</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-wider">Followers</span>
            </div>
            
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.01]">
              <BookOpen size={14} className="text-slate-500 mb-0.5" />
              <span className="text-xs font-bold text-slate-200">{stories.length}</span>
              <span className="text-[8px] text-slate-500 uppercase tracking-wider">Stories</span>
            </div>

            <button
              onClick={handleUpvote}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 ${
                hasUpvoted 
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400 scale-[0.97]" 
                  : "bg-white/5 border-transparent text-slate-400 hover:bg-white/10"
              }`}
            >
              <Heart size={14} className={`${hasUpvoted ? "fill-rose-400 text-rose-400" : "text-slate-500"}`} />
              <span className="text-xs font-bold">{upvotes}</span>
              <span className="text-[8px] uppercase tracking-wider">{hasUpvoted ? "Upvoted!" : "Upvote"}</span>
            </button>
          </div>

        </div>

        {/* Anthology Feed Header */}
        <div className="flex flex-col gap-3">
          <h2 className="font-body text-[10px] font-bold text-slate-500 uppercase tracking-[0.25em] px-1 pt-2">
            Published Works
          </h2>
          
          <div className="flex flex-col gap-3">
            {stories.map((story) => {
              const mood = MOOD_CONFIG[story.mood] || { emoji: "📖", label: "Story", accent: "#94a3b8" };
              return (
                <Link 
                  key={story.id} 
                  href={`/read/${encodeURIComponent(story.id)}`}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 hover:bg-white/[0.05] hover:border-white/10 hover:-translate-y-0.5 transition-all duration-300 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[9px] uppercase tracking-widest text-slate-400">
                      <span>{mood.emoji}</span>
                      <span style={{ color: mood.accent }}>{mood.label}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <Clock size={11} />
                      <span>{story.totalReadMinutes}m</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-100 group-hover:text-amber-200 transition-colors line-clamp-1">
                      {story.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-body line-clamp-2 mt-0.5 leading-relaxed">
                      {story.tagline}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}