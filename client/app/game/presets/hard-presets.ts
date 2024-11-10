import { Preset } from "./types";

export const hardPresets: Preset[] = [
  {
    lasers: [
      { x: 0, y: 150, angle: 45 },
      { x: 50, y: 250, angle: -45 },
      { x: 100, y: 150, angle: 45 },
    ],
    difficulty: "hard",
  },
];
