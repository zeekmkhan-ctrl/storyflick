"use client";

import { Mood } from "@/types";
import MoodFilter from "./MoodFilter";

interface MoodFilterWrapperProps {
  selectedMood: Mood | null;
}

export default function MoodFilterWrapper({
  selectedMood,
}: MoodFilterWrapperProps) {
  return (
    <div className="mb-2">
      <MoodFilter
        selected={selectedMood}
        onSelect={(mood) => {
          if (mood) {
            window.location.href = `/?mood=${mood}`;
          } else {
            window.location.href = "/";
          }
        }}
      />
    </div>
  );
}
