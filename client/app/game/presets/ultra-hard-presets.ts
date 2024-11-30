// presets/ultraHardPresets.ts

import { Preset } from "./types";
import { getCoordinates } from "../utils/coordinates";

export const ultraHardPresets: Preset[] = [];

// Example ultra-hard patterns
const ultraHardPatterns = [
  // Complex maze
  [
    { x: 100, y: 100, angle: 0 },
    { x: 130, y: 130, angle: 45 },
    { x: 160, y: 160, angle: 90 },
    { x: 340, y: 340, angle: 0 },
  ],
  // Tight tunnel with obstacles
  [
    { x: 150, y: 50, angle: 90 },
    { x: 150, y: 350, angle: 90 },
    { x: 200, y: 50, angle: 90 },
    { x: 200, y: 350, angle: 90 },
  ],
  // Rapid zig-zag with minimal gaps
  [
    { x: 100, y: 100, angle: 0 },
    { x: 125, y: 300, angle: 0 },
    { x: 150, y: 100, angle: 0 },
  ],
];

for (let i = 0; i < 30; i++) {
  const pattern = ultraHardPatterns[i % ultraHardPatterns.length];
  const lasers = pattern.map((laser) => ({
    ...getCoordinates({ x: laser.x, y: laser.y }),
    angle: laser.angle,
  }));
  ultraHardPresets.push({
    lasers,
    coins: [],
    difficulty: "ultra-hard",
  });
}
