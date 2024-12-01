export type LaserConfig = {
  x: number;
  y: number;
  angle?: number;
  length?: number;
};

export interface CoinConfig {
  x: number;
  y: number;
}

export interface Preset {
  lasers: LaserConfig[];
  coins?: CoinConfig[];
  difficulty: string;
}

export type PresetDifficulty =
  | "easy"
  | "easy-coins"
  | "medium"
  | "hard"
  | "ultra-hard";

// utils/difficultyLevels.ts

export interface DifficultyLevel {
  name: string;
  minScore: number;
  maxScore: number;
  presetTypes: PresetDifficulty[];
  obstacles: {
    spawnRateMultiplier: number;
    obstacleConfigs: ObstacleConfig[]; // Список конфигураций препятствий с весами
  };
  coinPresetFrequency: number; // Чем выше число, тем реже появляются монеты
}

export interface ObstacleConfig {
  name: string; // Идентификатор конфигурации
  weight: number; // Вес для случайного выбора
  obstacleType: "rocket" | "laserCannon"; // Тип препятствия
  variants: ObstacleVariant[]; // Список вариантов препятствий в этой конфигурации
}

export interface ObstacleVariant {
  type: string; // Тип, например 'static', 'homing', 'dynamic'
  position?: {
    x?: number; // Относительная X позиция (опционально)
    y?: number | "top" | "middle" | "bottom"; // Относительная Y позиция или описание
  };
}

export type ObstacleVariantType = "static" | "homing" | "dynamic";
