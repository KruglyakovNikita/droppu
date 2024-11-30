import { Preset } from "./types";
import { getCoordinates } from "../utils/coordinates";

export const mediumPresets: Preset[] = [];

// Example preset patterns
const mediumPatterns = [
  // Zig-zag pattern
  [
    { x: 100, y: 100, angle: 0 },
    { x: 200, y: 300, angle: 0 },
    { x: 300, y: 100, angle: 0 },
    { x: 400, y: 300, angle: 0 },
  ],
  // Tunnel pattern
  [
    { x: 150, y: 50, angle: 90 },
    { x: 150, y: 350, angle: 90 },
    { x: 300, y: 50, angle: 90 },
    { x: 300, y: 350, angle: 90 },
  ],
  // Wave pattern
  [
    { x: 100, y: 200, angle: 45 },
    { x: 200, y: 200, angle: -45 },
    { x: 300, y: 200, angle: 45 },
    { x: 400, y: 200, angle: -45 },
  ],
];

for (let i = 0; i < 30; i++) {
  const pattern = mediumPatterns[i % mediumPatterns.length];
  const lasers = pattern.map((laser) => ({
    ...getCoordinates({ x: laser.x, y: laser.y }),
    angle: laser.angle,
  }));
  mediumPresets.push({
    lasers,
    coins: [],
    difficulty: "medium",
  });
}
