import { Preset } from "./types";

export const ultraHardPresets: Preset[] = [
  {
    difficulty: "ultra-hard",
    lasers: [
      { x: 0, y: 50, length: 100 },
      { x: 50, y: 100, length: 100 },
      { x: 100, y: 150, length: 100 },
      { x: 150, y: 200, length: 100 },
      { x: 200, y: 250, length: 100 },
      { x: 250, y: 300, length: 100 },
    ],
  },
  {
    difficulty: "ultra-hard",
    lasers: [
      { x: 0, y: 200, angle: 90, length: 100 },
      { x: 50, y: 200, angle: 0, length: 100 },
      { x: 100, y: 200, angle: -90, length: 100 },
    ],
  },
  // Добавьте другие ультрасложные пресеты
];
