import type { Difficulty } from "./content/types";

/**
 * Difficulty presentation metadata.
 *
 * This lives outside `lib/content/index.ts` on purpose. Client components need
 * these styles, and importing them from the content barrel would drag every
 * room — including `accept` arrays and `correctOptionId` answer keys — into the
 * browser bundle. Keep this module dependency-free.
 */
export const difficultyMeta: Record<
  Difficulty,
  { label: string; text: string; bg: string; border: string; bar: string }
> = {
  easy: {
    label: "Easy",
    text: "text-signal-green",
    bg: "bg-signal-green/10",
    border: "border-signal-green/40",
    bar: "bg-signal-green",
  },
  medium: {
    label: "Pro",
    text: "text-signal-amber",
    bg: "bg-signal-amber/10",
    border: "border-signal-amber/40",
    bar: "bg-signal-amber",
  },
  hard: {
    label: "Hard",
    text: "text-signal-red",
    bg: "bg-signal-red/10",
    border: "border-signal-red/40",
    bar: "bg-signal-red",
  },
  insane: {
    label: "Insane",
    text: "text-signal-violet",
    bg: "bg-signal-violet/10",
    border: "border-signal-violet/40",
    bar: "bg-signal-violet",
  },
};
