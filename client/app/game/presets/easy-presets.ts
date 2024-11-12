// presets/easy-presets.ts

import { Preset } from "./types";

const MIN_GAP_LASER = 25;
const ZERO_GAP_LASER = 0;
const MIN_FLIGHT_DISTANCE_BETWEEN = 150;

export const easyPresets: Preset[] = [
  ////////////////-------------------------
  // Можно пролететь по диагонали мешает
  {
    lasers: [
      { x: 0, y: 100 },
      { x: 100, y: 200 },
      { x: 200, y: 300 },
    ],
    difficulty: "easy",
  },
  // Коридор с препятствиями снизу чутка и сверзу чутка
  {
    lasers: [
      { x: 0, y: 0 },
      { x: 0, y: 400 },
      { x: 100, y: 0 },
      { x: 100, y: 400 },
      { x: 200, y: 0 },
      { x: 200, y: 400 },
    ],
    difficulty: "easy",
  },
  {
    // Диагональ по середине влево вниз
    lasers: [
      { x: 0, y: 160, angle: -45 },
      { x: 80, y: 240, angle: -45 },
    ],
    difficulty: "easy",
  },
  {
    //Диагональ по середине вправо верз
    lasers: [
      { x: 80, y: 160, angle: 45 },
      { x: 0, y: 240, angle: 45 },
    ],
    difficulty: "easy",
  },
  {
    // Снизу и сверху
    lasers: [
      { x: 0, y: 50 },
      { x: 25, y: 350 },
    ],
    difficulty: "easy",
  },
  //----БОлее сложно что ли
  {
    //Пирамида сверху вниз
    lasers: [
      { x: 0, y: 0 },
      { x: 65, y: 100 },
      { x: 130, y: 200 },
      { x: 195, y: 100 },
      { x: 260, y: 0 },
      { x: 325, y: 300 },
    ],
    difficulty: "easy",
  },

  //снизу палки и сверху пирамидка
  {
    lasers: [
      { x: 150, y: 125 },
      { x: 250, y: 125 },
      { x: 200, y: 50 },
      { x: 0, y: 360 },
      { x: 400, y: 360 },
    ],
    difficulty: "easy",
  },
  //Подьём верх
  {
    lasers: [
      { x: 0, y: 360 },
      { x: 65, y: 310 },
      { x: 130, y: 260 },
      { x: 195, y: 210 },
      { x: 260, y: 160 },
    ],
    difficulty: "easy",
  },
  //Опускание вниз
  {
    lasers: [
      { x: 0, y: 0 },
      { x: 65, y: 50 },
      { x: 130, y: 100 },
      { x: 195, y: 150 },
      { x: 260, y: 200 },
    ],
    difficulty: "easy",
  },
  // Шахматное расположение лазеров ТУТ НАДО КОИН ВСРЕДИНЕ
  {
    lasers: [
      { x: 0, y: 50 },
      { x: 65, y: 150 },
      { x: 195, y: 150 },
      { x: 195, y: 250, angle: 90 },
      { x: 325, y: 150 },
      { x: 390, y: 50 },
    ],
    difficulty: "easy",
  },
  // Лабиринт с короткими препятствиями сверху и снизу ТУТ НАДО КОИН ВСРЕДИНЕ
  {
    lasers: [
      { x: 0, y: 40 },
      { x: 65, y: 360 },
      { x: 130, y: 70, angle: 90 },
      { x: 195, y: 330, angle: 90 },
      { x: 260, y: 40 },
      { x: 325, y: 360 },
    ],
    difficulty: "easy",
  },
  //Палки по середине и потом спуск вниз
  {
    difficulty: "easy",
    lasers: [
      { x: 0, y: 50, length: 100 },
      { x: 0, y: 350, length: 100 },
      { x: 100, y: 150, length: 80 },
      { x: 200, y: 250, length: 80 },
    ],
  },
  // Плотное нижнее и верхнее препятствия с проходом по центру
  {
    lasers: [
      { x: 0, y: 0 },
      { x: 65, y: 0 },
      { x: 130, y: 0 },
      { x: 195, y: 400 },
      { x: 260, y: 400 },
      { x: 325, y: 400 },
    ],
    difficulty: "easy",
  },
  {
    // Вертикльная волна
    lasers: [
      { x: 0, y: 150 },
      { x: 65, y: 100 },
      { x: 130, y: 150 },
      { x: 195, y: 100 },
      { x: 260, y: 150 },
      { x: 325, y: 100 },
      { x: 390, y: 150 },
    ],
    difficulty: "easy",
  },
  {
    // Maze-like barrier with upper and lower paths
    lasers: [
      { x: 0, y: 100 },
      { x: 65, y: 50 },
      { x: 130, y: 350 },
      { x: 195, y: 300 },
      { x: 260, y: 350 },
      { x: 325, y: 50 },
      { x: 390, y: 100 },
    ],
    difficulty: "easy",
  },
  {
    // Снизу и сверху
    lasers: [
      { x: 0, y: 40, angle: -45 },
      { x: 25, y: 360, angle: 45 },
    ],
    difficulty: "easy",
  },
  {
    // Снизу и сверху
    lasers: [
      { x: 0, y: 40, angle: -45 },
      { x: 0, y: 360, angle: 45 },
      { x: 80, y: 40, angle: 45 },
      { x: 80, y: 360, angle: -45 },
    ],
    difficulty: "easy",
  },
  {
    // По середине и снизу сверху
    lasers: [
      { x: 0, y: 220, angle: 90 },
      { x: 120, y: 220, angle: 90 },
      { x: 340, y: 360 },
      { x: 340, y: 40 },
    ],
    difficulty: "easy",
  },
  {
    // По середине и снизу сверху ТУТ МОЖНО МОНЕТЫ
    lasers: [
      { x: 0, y: 40 },
      { x: 100, y: 360, angle: 90 },
      { x: 200, y: 360, angle: 90 },
      { x: 300, y: 360, angle: 90 },
      { x: 400, y: 40 },
    ],
    difficulty: "easy",
  },
  {
    // ТОЛЬКО СВЕРХУ ПО ДИАЛОНАГИ
    lasers: [{ x: 0, y: 40, angle: -45 }],
    difficulty: "easy",
  },
  {
    // ТОЛЬКО СВЕРХУ
    lasers: [{ x: 0, y: 60 }],
    difficulty: "easy",
  },
  {
    // ТОЛЬКО СНИЗУ ПО ДИАЛОНАГИ
    lasers: [{ x: 0, y: 360, angle: 45 }],
    difficulty: "easy",
  },
  {
    // ТОЛЬКО СНИЗУ
    lasers: [{ x: 0, y: 350 }],
    difficulty: "easy",
  },
  {
    // ТОЛЬКО ПО СЕРЕДИНЕ
    lasers: [{ x: 0, y: 200 }],
    difficulty: "easy",
  },
  {
    // ТОЛЬКО СНИЗУ ГОРИЗОНТАЛЬ
    lasers: [{ x: 0, y: 370, angle: 90 }],
    difficulty: "easy",
  },
  {
    // ТОЛЬКО СВЕРХУ ГОРИЗОНТАЛЬ
    lasers: [{ x: 0, y: 30, angle: 90 }],
    difficulty: "easy",
  },
  {
    // ТОЛЬКО СВЕРХУ ГОРИЗОНТАЛЬ
    lasers: [{ x: 0, y: 220, angle: 90 }],
    difficulty: "easy",
  },
];
