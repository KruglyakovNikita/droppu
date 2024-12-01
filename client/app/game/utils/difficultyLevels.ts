// utils/difficultyLevels.ts

import { DifficultyLevel } from "../presets/types";
// utils/difficultyLevels.ts

export const difficultyLevels: DifficultyLevel[] = [
  {
    name: "Initial",
    minScore: 0,
    maxScore: Infinity,
    presetTypes: ["medium"],
    obstacles: {
      spawnRateMultiplier: 1,
      obstacleConfigs: [],
    },
    coinPresetFrequency: 10,
  },
  // {
  //   name: "Initial",
  //   minScore: 0,
  //   maxScore: 0,
  //   presetTypes: ["easy", "medium"],
  //   obstacles: {
  //     spawnRateMultiplier: 1,
  //     obstacleConfigs: [],
  //   },
  //   coinPresetFrequency: 2,
  // },
  // {
  //   name: "Intermediate",
  //   minScore: 15000,
  //   maxScore: 30000,
  //   presetTypes: ["medium", "hard"],
  //   obstacles: {
  //     spawnRateMultiplier: 1,
  //     obstacleConfigs: [
  //       {
  //         name: "staticRocket",
  //         weight: 50,
  //         obstacleType: "rocket",
  //         variants: [{ type: "static" }],
  //       },
  //       {
  //         name: "staticLaserCannon",
  //         weight: 50,
  //         obstacleType: "laserCannon",
  //         variants: [{ type: "static" }],
  //       },
  //     ],
  //   },
  //   coinPresetFrequency: 5,
  // },
  // {
  //   name: "Advanced",
  //   minScore: 30000,
  //   maxScore: 60000,
  //   presetTypes: ["hard", "ultra-hard"],
  //   obstacles: {
  //     spawnRateMultiplier: 1.5,
  //     obstacleConfigs: [
  //       {
  //         name: "staticRocket",
  //         weight: 30,
  //         obstacleType: "rocket",
  //         variants: [{ type: "static" }],
  //       },
  //       {
  //         name: "homingRocket",
  //         weight: 20,
  //         obstacleType: "rocket",
  //         variants: [{ type: "homing" }],
  //       },
  //       {
  //         name: "doubleStaticLasersTopBottom",
  //         weight: 20,
  //         obstacleType: "laserCannon",
  //         variants: [
  //           { type: "static", position: { y: "top" } },
  //           { type: "static", position: { y: "bottom" } },
  //         ],
  //       },
  //       {
  //         name: "staticLaserCannon",
  //         weight: 30,
  //         obstacleType: "laserCannon",
  //         variants: [{ type: "static" }],
  //       },
  //     ],
  //   },
  //   coinPresetFrequency: 8,
  // },
  // {
  //   name: "Expert",
  //   minScore: 60000,
  //   maxScore: 75000,
  //   presetTypes: ["hard", "ultra-hard"],
  //   obstacles: {
  //     spawnRateMultiplier: 2,
  //     obstacleConfigs: [
  //       {
  //         name: "dynamicRocket",
  //         weight: 20,
  //         obstacleType: "rocket",
  //         variants: [{ type: "dynamic" }],
  //       },
  //       {
  //         name: "homingRocket",
  //         weight: 30,
  //         obstacleType: "rocket",
  //         variants: [{ type: "homing" }],
  //       },
  //       {
  //         name: "doubleStaticRocketsTopBottom",
  //         weight: 30,
  //         obstacleType: "rocket",
  //         variants: [
  //           { type: "static", position: { y: "top" } },
  //           { type: "static", position: { y: "bottom" } },
  //         ],
  //       },
  //       {
  //         name: "doubleDynamicLasers",
  //         weight: 15,
  //         obstacleType: "laserCannon",
  //         variants: [
  //           { type: "static", position: { y: "top" } },
  //           { type: "static", position: { y: "bottom" } },
  //           { type: "homing" },
  //         ],
  //       },
  //       {
  //         name: "dynamicLaserCannon",
  //         weight: 15,
  //         obstacleType: "laserCannon",
  //         variants: [{ type: "dynamic" }],
  //       },
  //     ],
  //   },
  //   coinPresetFrequency: 12,
  // },
  // {
  //   name: "Master",
  //   minScore: 75000,
  //   maxScore: Infinity,
  //   presetTypes: ["ultra-hard"],
  //   obstacles: {
  //     spawnRateMultiplier: 2.5,
  //     obstacleConfigs: [
  //       {
  //         name: "dynamicRocket",
  //         weight: 40,
  //         obstacleType: "rocket",
  //         variants: [{ type: "dynamic" }],
  //       },
  //       {
  //         name: "homingRocket",
  //         weight: 15,
  //         obstacleType: "rocket",
  //         variants: [{ type: "homing" }],
  //       },
  //       {
  //         name: "homingLaserCannon",
  //         weight: 15,
  //         obstacleType: "laserCannon",
  //         variants: [{ type: "homing" }],
  //       },
  //       {
  //         name: "dynamicLaserCannon",
  //         weight: 30,
  //         obstacleType: "laserCannon",
  //         variants: [{ type: "dynamic" }],
  //       },
  //       {
  //         name: "doubleDynamicLasers",
  //         weight: 10,
  //         obstacleType: "laserCannon",
  //         variants: [
  //           { type: "static", position: { y: "top" } },
  //           { type: "static", position: { y: "bottom" } },
  //         ],
  //       },
  //       {
  //         name: "doubleDynamicLasers",
  //         weight: 15,
  //         obstacleType: "laserCannon",
  //         variants: [
  //           { type: "static", position: { y: "top" } },
  //           { type: "static", position: { y: "bottom" } },
  //           { type: "dynamic" },
  //         ],
  //       },
  //     ],
  //   },
  //   coinPresetFrequency: 15,
  // },
];

export function getCurrentDifficultyLevel(score: number): DifficultyLevel {
  return (
    difficultyLevels.find(
      (level) => score >= level.minScore && score < level.maxScore
    ) || difficultyLevels[difficultyLevels.length - 1]
  );
}
