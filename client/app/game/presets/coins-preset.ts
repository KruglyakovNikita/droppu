import { getCoordinates } from "../utils/coordinates";
import { Preset } from "./types";

export const coinsPresets: Preset[] = [];

// Generate 30 coin presets
for (let i = 0; i < 30; i++) {
  const coins: Array<{ x: number; y: number }> = [];
  for (let j = 0; j < 10; j++) {
    const x = 100 + j * 50; // Spacing coins horizontally
    const y = Phaser.Math.Between(50, 350); // Random vertical position
    const coordinates = getCoordinates({ x, y });

    coins.push(coordinates);
  }
  coinsPresets.push({
    lasers: [],
    coins,
    difficulty: "easy-coin",
  });
}
