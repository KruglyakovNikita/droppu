// presets/coinsPresets.ts

import { Preset } from "./types";
import { getCoordinates } from "../utils"; // Убедитесь, что путь правильный

export const coinsPresets: Preset[] = [
  {
    lasers: [
      // Пресеты лазеров для easy-coin уровня, если они понадобятся
    ],
    coins: [
      getCoordinates({ x: 150, y: 200 }), // { x: 0.25, y: 0.5 }
      getCoordinates({ x: 250, y: 200 }), // { x: 0.4167, y: 0.5 }
      getCoordinates({ x: 350, y: 200 }), // { x: 0.5833, y: 0.5 }
      getCoordinates({ x: 450, y: 200 }), // { x: 0.75, y: 0.5 }
    ],
    difficulty: "easy-coin",
  },
];
