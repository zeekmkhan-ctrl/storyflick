"use client";
import { createUser, setOnboarded } from "@/lib/storage";
import { useUser } from "@/lib/userContext";

interface OnboardingProps {
  onClose: () => void;
}

export default function Onboarding({ onClose }: OnboardingProps) {
  const { setUser } = useUser();

  const handleStart = () => {
    const user = createUser("Reader", "");
    setUser(user);
    setOnboarded();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f0c08] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(255,255,255,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,210,170,0.06),transparent_22%),linear-gradient(180deg,rgba(21,17,15,0.92),rgba(12,10,9,0.94))]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(126,98,66,0.08),transparent_32%),linear-gradient(90deg,rgba(25,19,15,0.35),rgba(18,14,11,0.15))]" style={{ backgroundBlendMode: "overlay" }} />
      <div className="relative z-10 flex h-full w-full max-w-md flex-col items-center justify-between px-6 py-14">
        <div className="w-full rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-[0_40px_120px_-50px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight text-slate-50">
              Cinema in sentences.
            </h1>
            <p className="max-w-xs text-base text-slate-300 leading-relaxed">
              Built to read quickly and linger.
            </p>
          </div>
        </div>

        <div className="w-full space-y-4">
          <button
            type="button"
            onClick={handleStart}
            className="w-full rounded-full bg-white px-6 py-4 text-lg font-semibold text-slate-900 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.9)] transition hover:shadow-[0_24px_90px_-38px_rgba(15,23,42,0.9)]"
          >
            Start Reading
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-sm text-slate-200/80"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
