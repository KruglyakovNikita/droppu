// presets/ultraHardPresets.ts

import { Preset } from "./types";
import { getCoordinates } from "../utils/coordinates";

export const ultraHardPresets: Preset[] = [];

// Example ultra-hard patterns
const ultraHardPatterns = [
  // // Лабиринт с чередующимися вертикальными и горизонтальными лазерами
  // {
  //   lasers: [
  //     { ...getCoordinates({ x: 0, y: 50 }), angle: 90 },
  //     { ...getCoordinates({ x: 100, y: 150 }), angle: 0 },
  //     { ...getCoordinates({ x: 200, y: 250 }), angle: 90 },
  //     { ...getCoordinates({ x: 350, y: 350 }), angle: 0 },
  //     { ...getCoordinates({ x: 500, y: 250 }), angle: 90 },
  //     { ...getCoordinates({ x: 600, y: 150 }), angle: 0 },
  //     { ...getCoordinates({ x: 700, y: 50 }), angle: 90 },
  //   ],
  //   difficulty: "ultra-hard",
  // },
  // // Смешанный паттерн с различными углами и длинами лазеров
  // {
  //   lasers: [
  //     { ...getCoordinates({ x: 100, y: 100 }), angle: 45, length: 0.2 },
  //     { ...getCoordinates({ x: 200, y: 300 }), angle: -45, length: 0.25 },
  //     { ...getCoordinates({ x: 300, y: 100 }), angle: 30, length: 0.3 },
  //     { ...getCoordinates({ x: 400, y: 300 }), angle: -30, length: 0.35 },
  //     { ...getCoordinates({ x: 500, y: 100 }), angle: 60, length: 0.4 },
  //     { ...getCoordinates({ x: 600, y: 300 }), angle: -60, length: 0.45 },
  //   ],
  //   difficulty: "medium",
  // },
  // // Ромб с пересечением по центру
  // {
  //   lasers: [
  //     getCoordinates({ x: 100, y: 200 }), // { x: 0.25, y: 0.5 }
  //     getCoordinates({ x: 200, y: 50 }), // { x: 0.5, y: 0.125 }
  //     getCoordinates({ x: 200, y: 350 }), // { x: 0.5, y: 0.875 }
  //     getCoordinates({ x: 300, y: 200 }), // { x: 0.75, y: 0.5 }
  //   ],
  //   difficulty: "medium",
  // },
  // // Ступенчатая структура
  // {
  //   lasers: [
  //     getCoordinates({ x: 50, y: 50 }), // { x: 0.125, y: 0.125 }
  //     getCoordinates({ x: 150, y: 150 }), // { x: 0.375, y: 0.375 }
  //     getCoordinates({ x: 250, y: 250 }), // { x: 0.625, y: 0.625 }
  //     getCoordinates({ x: 350, y: 350 }), // { x: 0.875, y: 0.875 }
  //   ],
  //   difficulty: "medium",
  // },
  ///-----
];
