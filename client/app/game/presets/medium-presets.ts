// presets/medium-presets.ts

import { Preset } from "./types";
import { getCoordinates } from "../utils/coordinates";

const MIN_GAP_LASER = 20;
const ZERO_GAP_LASER = 0;
const MIN_FLIGHT_DISTANCE_BETWEEN = 100;

export const mediumPresets: Preset[] = [
  // Волнообразный паттерн с увеличивающимися промежутками
  {
    lasers: [
      { ...getCoordinates({ x: 50, y: 50 }), angle: 15 },
      { ...getCoordinates({ x: 150, y: 200 }), angle: -15 },
      { ...getCoordinates({ x: 250, y: 350 }), angle: 15 },
      { ...getCoordinates({ x: 375, y: 200 }), angle: -15 },
      { ...getCoordinates({ x: 500, y: 50 }), angle: 15 },
      { ...getCoordinates({ x: 600, y: 200 }), angle: -15 },
    ],
    difficulty: "medium",
  },
  // Комбинация вертикальных и диагональных лазеров
  {
    lasers: [
      { ...getCoordinates({ x: 100, y: 25 }), angle: 90 },
      { ...getCoordinates({ x: 200, y: 100 }), angle: 45 },
      { ...getCoordinates({ x: 300, y: 200 }), angle: -45 },
      { ...getCoordinates({ x: 400, y: 300 }), angle: 90 },
      { ...getCoordinates({ x: 500, y: 400 }), angle: 45 },
    ],
    difficulty: "medium",
  },
  // Лабиринт с движущимися лазерами (эмулируется через различные углы) (сверху)
  {
    lasers: [
      { ...getCoordinates({ x: 0, y: 100 }), angle: 30 },
      { ...getCoordinates({ x: 150, y: 200 }), angle: -30 },
      { ...getCoordinates({ x: 300, y: 100 }), angle: 30 },
      { ...getCoordinates({ x: 450, y: 200 }), angle: -30 },
      { ...getCoordinates({ x: 600, y: 100 }), angle: 30 },
      { ...getCoordinates({ x: 750, y: 200 }), angle: -30 },
    ],
    difficulty: "medium",
  },
  // Лабиринт с движущимися лазерами (эмулируется через различные углы) (снизу)
  {
    lasers: [
      { ...getCoordinates({ x: 0, y: 250 }), angle: -30 },
      { ...getCoordinates({ x: 150, y: 350 }), angle: 30 },
      { ...getCoordinates({ x: 300, y: 250 }), angle: -30 },
      { ...getCoordinates({ x: 450, y: 350 }), angle: 30 },
      { ...getCoordinates({ x: 600, y: 250 }), angle: -30 },
      { ...getCoordinates({ x: 750, y: 350 }), angle: 30 },
    ],
    difficulty: "medium",
  },
  // Комбинация горизонтальных и вертикальных лазеров с узкими проходами
  {
    lasers: [
      { ...getCoordinates({ x: 50, y: 50 }), angle: 0 },
      { ...getCoordinates({ x: 125, y: 50 }), angle: 45 },
      { ...getCoordinates({ x: 150, y: 375 }), angle: 90 },
      { ...getCoordinates({ x: 250, y: 375 }), angle: 90 },
      { ...getCoordinates({ x: 375, y: 50 }), angle: -45 },
      { ...getCoordinates({ x: 350, y: 375 }), angle: 90 },
      { ...getCoordinates({ x: 450, y: 50 }), angle: 0 },
    ],
    difficulty: "medium",
  },
  // Смешанный паттерн с различными углами и длинами лазеров
  {
    lasers: [
      { ...getCoordinates({ x: 100, y: 100 }), angle: 45 },
      { ...getCoordinates({ x: 200, y: 300 }), angle: -45 },
      { ...getCoordinates({ x: 300, y: 100 }), angle: 30 },
      { ...getCoordinates({ x: 400, y: 300 }), angle: -30 },
      { ...getCoordinates({ x: 500, y: 100 }), angle: 60 },
      { ...getCoordinates({ x: 600, y: 300 }), angle: -60 },
    ],
    difficulty: "medium",
  },
  // Паттерн с лазерами, блокирующими разные зоны экрана
  {
    lasers: [
      { ...getCoordinates({ x: 0, y: 0 }), angle: 45 },
      { ...getCoordinates({ x: 100, y: 400 }), angle: -45 },
      { ...getCoordinates({ x: 200, y: 0 }), angle: 45 },
      { ...getCoordinates({ x: 300, y: 400 }), angle: -45 },
      { ...getCoordinates({ x: 400, y: 0 }), angle: 45 },
      { ...getCoordinates({ x: 500, y: 400 }), angle: -45 },
      { ...getCoordinates({ x: 600, y: 0 }), angle: 45 },
      { ...getCoordinates({ x: 700, y: 400 }), angle: -45 },
    ],
    difficulty: "medium",
  },
  // Комбинация горизонтальных, вертикальных и диагональных лазеров
  {
    lasers: [
      { ...getCoordinates({ x: 100, y: 50 }), angle: 0 },
      { ...getCoordinates({ x: 200, y: 25 }), angle: 90 },
      { ...getCoordinates({ x: 300, y: 50 }), angle: 45 },
      { ...getCoordinates({ x: 400, y: 200 }), angle: -45 },
      { ...getCoordinates({ x: 500, y: 375 }), angle: 90 },
      { ...getCoordinates({ x: 600, y: 350 }), angle: 0 },
      { ...getCoordinates({ x: 700, y: 350 }), angle: 45 },
    ],
    difficulty: "medium",
  },
  // Волна с чередующимися углами
  {
    lasers: [
      getCoordinates({ x: 0, y: 150 }), // { x: 0.0, y: 0.375 }
      getCoordinates({ x: 150, y: 200 }), // { x: 0.375, y: 0.5 }
      getCoordinates({ x: 300, y: 150 }), // { x: 0.75, y: 0.375 }
    ],
    difficulty: "medium",
  },
  // Туннель с расширением
  {
    lasers: [
      { ...getCoordinates({ x: 50, y: 50 }), angle: -50 }, // { x: 0.125, y: 0.125 }
      { ...getCoordinates({ x: 50, y: 350 }), angle: 50 }, // { x: 0.125, y: 0.875 }
      { ...getCoordinates({ x: 150, y: 100 }), angle: -90 }, // { x: 0.375, y: 0.25 }
      { ...getCoordinates({ x: 150, y: 300 }), angle: 90 }, // { x: 0.375, y: 0.75 }
      { ...getCoordinates({ x: 250, y: 75 }), angle: -90 }, // { x: 0.375, y: 0.25 }
      { ...getCoordinates({ x: 250, y: 325 }), angle: 90 }, // { x: 0.375, y: 0.75 }
      { ...getCoordinates({ x: 350, y: 100 }), angle: -90 }, // { x: 0.375, y: 0.25 }
      { ...getCoordinates({ x: 350, y: 300 }), angle: 90 }, // { x: 0.375, y: 0.75 }
      { ...getCoordinates({ x: 450, y: 50 }), angle: 50 }, // { x: 0.125, y: 0.125 }
      { ...getCoordinates({ x: 450, y: 350 }), angle: -50 }, // { x: 0.125, y: 0.875 }
    ],
    difficulty: "medium",
  },
  // Крестообразная структура
  {
    lasers: [
      getCoordinates({ x: 200, y: 50 }), // { x: 0.5, y: 0.125 }
      getCoordinates({ x: 200, y: 350 }), // { x: 0.5, y: 0.875 }
      getCoordinates({ x: 50, y: 200 }), // { x: 0.125, y: 0.5 }
      getCoordinates({ x: 350, y: 200 }), // { x: 0.875, y: 0.5 }
    ],
    difficulty: "medium",
  },
  // Хаотичное расположение
  {
    lasers: [
      getCoordinates({ x: 50, y: 150 }), // { x: 0.125, y: 0.375 }
      getCoordinates({ x: 100, y: 50 }), // { x: 0.25, y: 0.125 }
      getCoordinates({ x: 350, y: 350 }), // { x: 0.125, y: 0.375 }
      getCoordinates({ x: 400, y: 250 }), // { x: 0.25, y: 0.125 }
    ],
    difficulty: "medium",
  },
  // Зеркальная структура
  {
    lasers: [
      getCoordinates({ x: 50, y: 50 }), // { x: 0.125, y: 0.125 }
      getCoordinates({ x: 50, y: 350 }), // { x: 0.125, y: 0.125 }
      getCoordinates({ x: 200, y: 250 }), // { x: 0.375, y: 0.625 }
      getCoordinates({ x: 200, y: 150 }), // { x: 0.375, y: 0.375 }
      getCoordinates({ x: 300, y: 150 }), // { x: 0.625, y: 0.375 }
      getCoordinates({ x: 300, y: 250 }), // { x: 0.625, y: 0.625 }
      getCoordinates({ x: 450, y: 50 }), // { x: 0.875, y: 0.125 }
      getCoordinates({ x: 450, y: 350 }), // { x: 0.875, y: 0.125 }
    ],
    difficulty: "medium",
  },
  // Звезда с перекрестиями
  {
    lasers: [
      getCoordinates({ x: 100, y: 150 }), // { x: 0.25, y: 0.375 }
      getCoordinates({ x: 250, y: 250 }), // { x: 0.5, y: 0.625 }
      getCoordinates({ x: 400, y: 150 }), // { x: 0.75, y: 0.375 }
    ],
    difficulty: "medium",
  },
  // Диагональный лабиринт
  {
    lasers: [
      getCoordinates({ x: 50, y: 50 }), // { x: 0.125, y: 0.125 }
      getCoordinates({ x: 200, y: 200 }), // { x: 0.375, y: 0.375 }
      getCoordinates({ x: 300, y: 350 }), // { x: 0.625, y: 0.625 }
    ],
    difficulty: "medium",
  },
  // Flappy Bird: Трубы с двойными преградами
  {
    lasers: [
      { ...getCoordinates({ x: 100, y: 50 }), angle: -45 },
      { ...getCoordinates({ x: 175, y: 50 }), angle: 45 },
      { ...getCoordinates({ x: 100, y: 350 }), angle: 45 },
      { ...getCoordinates({ x: 175, y: 350 }), angle: -45 },

      { ...getCoordinates({ x: 300, y: 350 }), angle: 45 },
      { ...getCoordinates({ x: 375, y: 275 }) },
      { ...getCoordinates({ x: 450, y: 350 }), angle: -45 },

      { ...getCoordinates({ x: 500, y: 50 }), angle: -45 },
      { ...getCoordinates({ x: 575, y: 125 }) },
      { ...getCoordinates({ x: 650, y: 50 }), angle: 45 },

      { ...getCoordinates({ x: 775, y: 50 }), angle: -45 },
      { ...getCoordinates({ x: 850, y: 50 }), angle: 45 },
      { ...getCoordinates({ x: 775, y: 350 }), angle: 45 },
      { ...getCoordinates({ x: 850, y: 350 }), angle: -45 },
    ],
    difficulty: "medium",
  },

  // Зигзаг с узкими проходами
  {
    lasers: [
      getCoordinates({ x: 0, y: 50 }),
      getCoordinates({ x: 150, y: 300 }),
      getCoordinates({ x: 300, y: 100 }),
      getCoordinates({ x: 450, y: 350 }),
      getCoordinates({ x: 600, y: 200 }),
    ],
    difficulty: "medium",
  },
];
