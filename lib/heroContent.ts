export type TimeChip = "Morning" | "Afternoon" | "Evening" | "Night" | "Late night";

export function getTimeChip(hour: number): TimeChip {
  if (hour >= 5 && hour < 12) return "Morning";
  if (hour >= 12 && hour < 17) return "Afternoon";
  if (hour >= 17 && hour < 20) return "Evening";
  if (hour >= 20) return "Night";
  return "Late night";
}

export function getHeadlineTimeOfDay(chip: TimeChip): string {
  switch (chip) {
    case "Morning":
      return "morning";
    case "Afternoon":
      return "afternoon";
    case "Evening":
      return "evening";
    case "Night":
    case "Late night":
      return "night";
  }
}

export function getTagline(date: Date): string {
  const day = date.getDay();
  if (day === 3) return "Halfway. You've earned this.";
  if (day === 0) return "Before Monday finds you.";

  const hour = date.getHours();
  if (hour >= 5 && hour < 9) return "Four minutes. Just for you.";
  if (hour >= 9 && hour < 12) return "Steal four minutes. It's allowed.";
  if (hour >= 12 && hour < 14) return "Best lunch break. No cutlery.";
  if (hour >= 14 && hour < 17) return "Better than another coffee.";
  if (hour >= 17 && hour < 20) return "You made it. Here's four minutes.";
  if (hour >= 20) return "The quiet earned this.";
  return "Good. So is this story.";
}

export function getHeadline(firstName: string, date: Date): string {
  const hour = date.getHours();
  if (hour === 2) return `Still awake, ${firstName}?`;

  const chip = getTimeChip(hour);
  const timeOfDay = getHeadlineTimeOfDay(chip);
  return `Good ${timeOfDay}, ${firstName}`;
}

export function getCtaLabel(hasStreak: boolean): string {
  return hasStreak ? "Continue Your Streak →" : "Read a Story →";
}
