// presets/hardPresets.ts

import { Preset } from "./types";
import { getCoordinates } from "../utils/coordinates";

export const hardPresets: Preset[] = [];

// Example hard patterns
const hardPatterns = [
  // Tight zig-zag pattern
  [
    { x: 100, y: 100, angle: 0 },
    { x: 150, y: 300, angle: 0 },
    { x: 200, y: 100, angle: 0 },
    { x: 250, y: 300, angle: 0 },
    { x: 300, y: 100, angle: 0 },
  ],
  // Vertical bars
  [
    { x: 150, y: 50, angle: 90 },
    { x: 200, y: 50, angle: 90 },
    { x: 250, y: 50, angle: 90 },
    { x: 300, y: 50, angle: 90 },
    { x: 350, y: 50, angle: 90 },
  ],
  // Moving maze
  [
    { x: 150, y: 200, angle: 45 },
    { x: 200, y: 200, angle: -45 },
    { x: 250, y: 200, angle: 45 },
    { x: 300, y: 200, angle: -45 },
    { x: 350, y: 200, angle: 45 },
  ],
];

for (let i = 0; i < 30; i++) {
  const pattern = hardPatterns[i % hardPatterns.length];
  const lasers = pattern.map((laser) => ({
    ...getCoordinates({ x: laser.x, y: laser.y }),
    angle: laser.angle,
  }));
  hardPresets.push({
    lasers,
    coins: [],
    difficulty: "hard",
  });
}
