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
  ////----
  // Ромб с пересечением по центру
  {
    lasers: [
      getCoordinates({ x: 100, y: 200 }), // { x: 0.25, y: 0.5 }
      getCoordinates({ x: 200, y: 50 }), // { x: 0.5, y: 0.125 }
      getCoordinates({ x: 200, y: 350 }), // { x: 0.5, y: 0.875 }
      getCoordinates({ x: 300, y: 200 }), // { x: 0.75, y: 0.5 }
    ],
    difficulty: "medium",
  },
  // Ступенчатая структура
  {
    lasers: [
      getCoordinates({ x: 50, y: 50 }), // { x: 0.125, y: 0.125 }
      getCoordinates({ x: 150, y: 150 }), // { x: 0.375, y: 0.375 }
      getCoordinates({ x: 250, y: 250 }), // { x: 0.625, y: 0.625 }
      getCoordinates({ x: 350, y: 350 }), // { x: 0.875, y: 0.875 }
    ],
    difficulty: "medium",
  },
];
