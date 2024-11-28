// presets/hardPresets.ts

import { Preset } from "./types";
import { getCoordinates } from "../utils"; // Убедитесь, что путь правильный

export const hardPresets: Preset[] = [
  {
    // Только сверху горизонталь
    lasers: [
      { ...getCoordinates({ x: 0, y: 220 }), angle: 90 }, // { x: 0.0, y: 0.55 }, angle: 90
    ],
    difficulty: "hard",
  },
];
