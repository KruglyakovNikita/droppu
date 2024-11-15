// Тип для конфигурации лазера
export interface LaserConfig {
  x: number;
  y: number;
  angle?: number;
  length?: number;
}

// Тип для пресета
export interface Preset {
  lasers: LaserConfig[];
  difficulty: "easy" | "medium" | "hard" | "ultra-hard";
}
