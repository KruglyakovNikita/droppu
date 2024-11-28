import { Preset } from "./presets/types";
import { easyPresets } from "./presets/easy-presets";
import { coinsPresets } from "./presets/coins-preset";
import { mediumPresets } from "./presets/medium-presets";
import { hardPresets } from "./presets/hard-presets";
import { ultraHardPresets } from "./presets/ultra-hard-presets";

export function getRandomDifficulty(
  distance: number = 0
): "easy" | "medium" | "hard" | "ultra-hard" {
  const difficulties = ["easy", "medium", "hard", "ultra-hard"] as const;
  const weights = [50, 30, 15, 5]; // Начальные вероятности

  // Увеличиваем вероятность сложных пресетов по мере продвижения
  if (distance > 1000) {
    weights[1] += 10; // medium
    weights[0] -= 10; // easy
  }
  if (distance > 2000) {
    weights[2] += 10; // hard
    weights[1] -= 10; // medium
  }
  if (distance > 3000) {
    weights[3] += 10; // ultra-hard
    weights[2] -= 10; // hard
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const randomNum = Phaser.Math.Between(0, totalWeight - 1);

  let cumulativeWeight = 0;
  for (let i = 0; i < difficulties.length; i++) {
    cumulativeWeight += weights[i];
    if (randomNum < cumulativeWeight) {
      return difficulties[i];
    }
  }

  return "easy";
}

export function getPresetPool(
  difficulty: "easy" | "medium" | "hard" | "ultra-hard" | "easy-coin"
): Preset[] {
  // switch (difficulty) {
  //   case "easy":
  //     return easyPresets;
  //   case "easy-coin":
  //     return coinsPresets;
  //   case "medium":
  //     return mediumPresets;
  //   case "hard":
  //     return hardPresets;
  //   case "ultra-hard":
  //     return ultraHardPresets;
  //   default:
  //     return easyPresets;
  // }
  switch (difficulty) {
    case "easy":
      return easyPresets;
    default:
      return easyPresets;
  }
}

// utils.ts

/**
 * Преобразует абсолютные координаты в относительные.
 * @param coord Абсолютные координаты { x: number, y: number }
 * @returns Относительные координаты { x: number, y: number }
 */
export function getCoordinates(coord: { x: number; y: number }): {
  x: number;
  y: number;
} {
  const BASE_WIDTH = 600;
  const BASE_HEIGHT = 400;
  return {
    x: Number((coord.x / BASE_WIDTH).toFixed(4)),
    y: Number((coord.y / BASE_HEIGHT).toFixed(4)),
  };
}
