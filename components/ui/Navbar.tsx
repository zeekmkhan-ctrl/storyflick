"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, BookOpen, User, Compass } from "lucide-react";
import { useUser } from "@/lib/userContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useUser();

  const navItems = [
    { href: "/", icon: Compass, label: "Discover" },
    { href: "/bookmarks", icon: BookOpen, label: "Saved" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <>
      {/* Top bar - allow it to scroll away naturally */}
      <header className="w-full z-40">
        <div className="flex items-center justify-between px-5 py-3 bg-black/25 backdrop-blur-md border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
              <span className="text-gold-400 text-xs font-display font-bold">S</span>
            </div>
            <span className="font-display text-lg font-semibold text-ink-100 tracking-tight">
              Storyflick
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-ink-800/60 rounded-full px-3 py-1.5 border border-white/5">
              <Flame size={13} className="text-orange-400" />
              {/* ⚡ FIXED: Added suppressHydrationWarning to handle the dynamic userContext loading state transition */}
              <span 
                suppressHydrationWarning 
                className="text-xs font-body font-medium text-ink-200"
              >
                {user?.readingStreak ?? 0}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 safe-bottom">
        <div className="flex items-center justify-around px-2 py-2 bg-black/40 backdrop-blur-md border-t border-white/10">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center gap-1 px-5 py-1.5 rounded-xl transition-all duration-200 ${
                  active
                    ? "text-gold-400"
                    : "text-ink-400 hover:text-ink-200"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[10px] font-body tracking-wide">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}