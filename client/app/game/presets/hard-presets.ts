import { Preset } from "./types";

export const hardPresets: Preset[] = [
  {
    difficulty: "hard",
    lasers: [
      { x: 0, y: 100, angle: 45, length: 80 },
      { x: 150, y: 200, angle: -45, length: 80 },
      { x: 300, y: 150, angle: 45, length: 80 },
    ],
  },
  {
    difficulty: "hard",
    lasers: [
      { x: 0, y: 50, length: 100 },
      { x: 0, y: 350, length: 100 },
      { x: 100, y: 150, length: 80 },
      { x: 200, y: 250, length: 80 },
    ],
  },
];
