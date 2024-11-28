// presets/easy-presets.ts

import { Preset } from "./types";
import { getCoordinates } from "../utils"; // Убедитесь, что путь правильный

const MIN_GAP_LASER = 25;
const ZERO_GAP_LASER = 0;
const MIN_FLIGHT_DISTANCE_BETWEEN = 150;

export const easyPresets: Preset[] = [
  // Можно пролететь по диагонали мешает
  {
    lasers: [
      getCoordinates({ x: 0, y: 100 }), // { x: 0.0, y: 0.25 }
      getCoordinates({ x: 100, y: 200 }), // { x: 0.1667, y: 0.5 }
      getCoordinates({ x: 200, y: 300 }), // { x: 0.3333, y: 0.75 }
    ],
    difficulty: "easy",
  },
  // Коридор с препятствиями снизу и сверху
  {
    lasers: [
      getCoordinates({ x: 0, y: 0 }), // { x: 0.0, y: 0.0 }
      getCoordinates({ x: 0, y: 400 }), // { x: 0.0, y: 1.0 }
      getCoordinates({ x: 100, y: 0 }), // { x: 0.1667, y: 0.0 }
      getCoordinates({ x: 100, y: 400 }), // { x: 0.1667, y: 1.0 }
      getCoordinates({ x: 200, y: 0 }), // { x: 0.3333, y: 0.0 }
      getCoordinates({ x: 200, y: 400 }), // { x: 0.3333, y: 1.0 }
    ],
    difficulty: "easy",
  },
  // Диагональ по середине влево вниз
  {
    lasers: [
      getCoordinates({ x: 0, y: 160 }), // { x: 0.0, y: 0.4 }
      getCoordinates({ x: 80, y: 240 }), // { x: 0.1333, y: 0.6 }
    ],
    difficulty: "easy",
  },
  // Диагональ по середине вправо вверх
  {
    lasers: [
      getCoordinates({ x: 80, y: 160 }), // { x: 0.1333, y: 0.4 }
      getCoordinates({ x: 0, y: 240 }), // { x: 0.0, y: 0.6 }
    ],
    difficulty: "easy",
  },
  // Снизу и сверху
  {
    lasers: [
      getCoordinates({ x: 0, y: 50 }), // { x: 0.0, y: 0.125 }
      getCoordinates({ x: 25, y: 350 }), // { x: 0.0417, y: 0.875 }
    ],
    difficulty: "easy",
  },
  // Пирамида сверху вниз
  {
    lasers: [
      getCoordinates({ x: 0, y: 0 }), // { x: 0.0, y: 0.0 }
      getCoordinates({ x: 65, y: 100 }), // { x: 0.1083, y: 0.25 }
      getCoordinates({ x: 130, y: 200 }), // { x: 0.2167, y: 0.5 }
      getCoordinates({ x: 195, y: 100 }), // { x: 0.325, y: 0.25 }
      getCoordinates({ x: 260, y: 0 }), // { x: 0.4333, y: 0.0 }
      getCoordinates({ x: 325, y: 300 }), // { x: 0.5417, y: 0.75 }
    ],
    difficulty: "easy",
  },
  // Снизу палки и сверху пирамидка
  {
    lasers: [
      getCoordinates({ x: 150, y: 125 }), // { x: 0.25, y: 0.3125 }
      getCoordinates({ x: 250, y: 125 }), // { x: 0.4167, y: 0.3125 }
      getCoordinates({ x: 200, y: 50 }), // { x: 0.3333, y: 0.125 }
      getCoordinates({ x: 0, y: 360 }), // { x: 0.0, y: 0.9 }
      getCoordinates({ x: 400, y: 360 }), // { x: 0.6667, y: 0.9 }
    ],
    difficulty: "easy",
  },
  // Подъём вверх
  {
    lasers: [
      getCoordinates({ x: 0, y: 360 }), // { x: 0.0, y: 0.9 }
      getCoordinates({ x: 65, y: 310 }), // { x: 0.1083, y: 0.775 }
      getCoordinates({ x: 130, y: 260 }), // { x: 0.2167, y: 0.65 }
      getCoordinates({ x: 195, y: 210 }), // { x: 0.325, y: 0.525 }
      getCoordinates({ x: 260, y: 160 }), // { x: 0.4333, y: 0.4 }
    ],
    difficulty: "easy",
  },
  // Опускание вниз
  {
    lasers: [
      getCoordinates({ x: 0, y: 0 }), // { x: 0.0, y: 0.0 }
      getCoordinates({ x: 65, y: 50 }), // { x: 0.1083, y: 0.125 }
      getCoordinates({ x: 130, y: 100 }), // { x: 0.2167, y: 0.25 }
      getCoordinates({ x: 195, y: 150 }), // { x: 0.325, y: 0.375 }
      getCoordinates({ x: 260, y: 200 }), // { x: 0.4333, y: 0.5 }
    ],
    difficulty: "easy",
  },
  // Шахматное расположение лазеров
  {
    lasers: [
      getCoordinates({ x: 0, y: 50 }), // { x: 0.0, y: 0.125 }
      getCoordinates({ x: 65, y: 150 }), // { x: 0.1083, y: 0.375 }
      getCoordinates({ x: 195, y: 150 }), // { x: 0.325, y: 0.375 }
      getCoordinates({ x: 195, y: 250 }), // { x: 0.325, y: 0.625 }, angle: 90
      getCoordinates({ x: 325, y: 150 }), // { x: 0.5417, y: 0.375 }
      getCoordinates({ x: 390, y: 50 }), // { x: 0.65, y: 0.125 }
    ],
    difficulty: "easy",
  },
  // Лабиринт с короткими препятствиями сверху и снизу
  {
    lasers: [
      getCoordinates({ x: 0, y: 40 }), // { x: 0.0, y: 0.1 }
      getCoordinates({ x: 65, y: 360 }), // { x: 0.1083, y: 0.9 }
      getCoordinates({ x: 130, y: 70 }), // { x: 0.2167, y: 0.175 }, angle: 90
      getCoordinates({ x: 195, y: 330 }), // { x: 0.325, y: 0.825 }, angle: 90
      getCoordinates({ x: 260, y: 40 }), // { x: 0.4333, y: 0.1 }
      getCoordinates({ x: 325, y: 360 }), // { x: 0.5417, y: 0.9 }
    ],
    difficulty: "easy",
  },
  // Палки по середине и потом спуск вниз
  {
    difficulty: "easy",
    lasers: [
      { ...getCoordinates({ x: 0, y: 50 }), length: 100 / 400 }, // { x: 0.0, y: 0.125 }, length scaled
      { ...getCoordinates({ x: 0, y: 350 }), length: 100 / 400 }, // { x: 0.0, y: 0.875 }, length scaled
      { ...getCoordinates({ x: 100, y: 150 }), length: 80 / 400 }, // { x: 0.1667, y: 0.375 }, length scaled
      { ...getCoordinates({ x: 200, y: 250 }), length: 80 / 400 }, // { x: 0.3333, y: 0.625 }, length scaled
    ],
  },
  // Плотные нижние и верхние препятствия с проходом по центру
  {
    lasers: [
      getCoordinates({ x: 0, y: 0 }), // { x: 0.0, y: 0.0 }
      getCoordinates({ x: 65, y: 0 }), // { x: 0.1083, y: 0.0 }
      getCoordinates({ x: 130, y: 0 }), // { x: 0.2167, y: 0.0 }
      getCoordinates({ x: 195, y: 400 }), // { x: 0.325, y: 1.0 }
      getCoordinates({ x: 260, y: 400 }), // { x: 0.4333, y: 1.0 }
      getCoordinates({ x: 325, y: 400 }), // { x: 0.5417, y: 1.0 }
    ],
    difficulty: "easy",
  },
  // Вертикальная волна
  {
    lasers: [
      getCoordinates({ x: 0, y: 150 }), // { x: 0.0, y: 0.375 }
      getCoordinates({ x: 65, y: 100 }), // { x: 0.1083, y: 0.25 }
      getCoordinates({ x: 130, y: 150 }), // { x: 0.2167, y: 0.375 }
      getCoordinates({ x: 195, y: 100 }), // { x: 0.325, y: 0.25 }
      getCoordinates({ x: 260, y: 150 }), // { x: 0.4333, y: 0.375 }
      getCoordinates({ x: 325, y: 100 }), // { x: 0.5417, y: 0.25 }
      getCoordinates({ x: 390, y: 150 }), // { x: 0.65, y: 0.375 }
    ],
    difficulty: "easy",
  },
  // Лабиринт с верхними и нижними путями
  {
    lasers: [
      getCoordinates({ x: 0, y: 100 }), // { x: 0.0, y: 0.25 }
      getCoordinates({ x: 65, y: 50 }), // { x: 0.1083, y: 0.125 }
      getCoordinates({ x: 130, y: 350 }), // { x: 0.2167, y: 0.875 }
      getCoordinates({ x: 195, y: 300 }), // { x: 0.325, y: 0.75 }
      getCoordinates({ x: 260, y: 350 }), // { x: 0.4333, y: 0.875 }
      getCoordinates({ x: 325, y: 50 }), // { x: 0.5417, y: 0.125 }
      getCoordinates({ x: 390, y: 100 }), // { x: 0.65, y: 0.25 }
    ],
    difficulty: "easy",
  },
  // Снизу и сверху
  {
    lasers: [
      { ...getCoordinates({ x: 0, y: 40 }), angle: -45 }, // { x: 0.0, y: 0.1 }, angle: -45
      { ...getCoordinates({ x: 25, y: 360 }), angle: 45 }, // { x: 0.0417, y: 0.9 }, angle: 45
    ],
    difficulty: "easy",
  },
  // Снизу и сверху
  {
    lasers: [
      { ...getCoordinates({ x: 0, y: 40 }), angle: -45 }, // { x: 0.0, y: 0.1 }, angle: -45
      { ...getCoordinates({ x: 0, y: 360 }), angle: 45 }, // { x: 0.0, y: 0.9 }, angle: 45
      { ...getCoordinates({ x: 80, y: 40 }), angle: 45 }, // { x: 0.1333, y: 0.1 }, angle: 45
      { ...getCoordinates({ x: 80, y: 360 }), angle: -45 }, // { x: 0.1333, y: 0.9 }, angle: -45
    ],
    difficulty: "easy",
  },
  // По середине и снизу сверху
  {
    lasers: [
      getCoordinates({ x: 0, y: 220 }), // { x: 0.0, y: 0.55 }, angle: 90
      getCoordinates({ x: 120, y: 220 }), // { x: 0.2, y: 0.55 }, angle: 90
      getCoordinates({ x: 340, y: 360 }), // { x: 0.5667, y: 0.9 }
      getCoordinates({ x: 340, y: 40 }), // { x: 0.5667, y: 0.1 }
    ],
    difficulty: "easy",
  },
  // По середине и снизу сверху с монетами
  {
    lasers: [
      getCoordinates({ x: 0, y: 40 }), // { x: 0.0, y: 0.1 }
      getCoordinates({ x: 100, y: 360 }), // { x: 0.1667, y: 0.9 }, angle: 90
      getCoordinates({ x: 200, y: 360 }), // { x: 0.3333, y: 0.9 }, angle: 90
      getCoordinates({ x: 300, y: 360 }), // { x: 0.5, y: 0.9 }, angle: 90
      getCoordinates({ x: 400, y: 40 }), // { x: 0.6667, y: 0.1 }
    ],
    difficulty: "easy",
  },
  // Только сверху по диагонали
  {
    lasers: [
      getCoordinates({ x: 0, y: 40 }), // { x: 0.0, y: 0.1 }, angle: -45
    ],
    difficulty: "easy",
  },
  // Только сверху
  {
    lasers: [
      getCoordinates({ x: 0, y: 60 }), // { x: 0.0, y: 0.15 }
    ],
    difficulty: "easy",
  },
  // Только снизу по диагонали
  {
    lasers: [
      getCoordinates({ x: 0, y: 360 }), // { x: 0.0, y: 0.9 }, angle: 45
    ],
    difficulty: "easy",
  },
  // Только снизу
  {
    lasers: [
      getCoordinates({ x: 0, y: 350 }), // { x: 0.0, y: 0.875 }
    ],
    difficulty: "easy",
  },
  // Только по середине
  {
    lasers: [
      getCoordinates({ x: 0, y: 200 }), // { x: 0.0, y: 0.5 }
    ],
    difficulty: "easy",
  },
  // Только снизу горизонталь
  {
    lasers: [
      getCoordinates({ x: 0, y: 370 }), // { x: 0.0, y: 0.925 }, angle: 90
    ],
    difficulty: "easy",
  },
  // Только сверху горизонталь
  {
    lasers: [
      getCoordinates({ x: 0, y: 30 }), // { x: 0.0, y: 0.075 }, angle: 90
    ],
    difficulty: "easy",
  },
  // Только сверху горизонталь
  {
    lasers: [
      getCoordinates({ x: 0, y: 220 }), // { x: 0.0, y: 0.55 }, angle: 90
    ],
    difficulty: "easy",
  },
];
