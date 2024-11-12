// presets/easy-presets.ts

import { Preset } from "./types";

const MIN_GAP_LASER = 25;
const ZERO_GAP_LASER = 0;
const MIN_FLIGHT_DISTANCE_BETWEEN = 150;

export const easyPresets: Preset[] = [
  // Простой одиночный лазер
  {
    lasers: [{ x: 0, y: Phaser.Math.Between(100, 300) }],
    difficulty: "easy",
  },
  // Два лазера сверху и снизу с промежутком посередине
  {
    lasers: [
      { x: 0, y: 50 },
      { x: 160, y: 350 },
    ],
    difficulty: "easy",
  },
  // Зигзагообразный пресет
  {
    lasers: [
      { x: 0, y: 100 },
      { x: 50, y: 150 },
      { x: 100, y: 200 },
      { x: 150, y: 250 },
      { x: 200, y: 300 },
    ],
    difficulty: "easy",
  },
  // Шахматный порядок
  {
    lasers: [
      { x: 0, y: 100 },
      { x: 50, y: 200 },
      { x: 100, y: 100 },
      { x: 150, y: 200 },
    ],
    difficulty: "easy",
  },
  // Коридор с препятствиями
  {
    lasers: [
      { x: 0, y: 0, length: 100 },
      { x: 0, y: 400, length: 100 },
      { x: 100, y: 0, length: 150 },
      { x: 100, y: 400, length: 150 },
    ],
    difficulty: "easy",
  },
];
