export type LaserConfig = {
  x: number;
  y: number;
  angle?: number;
  length?: number;
};

export type Preset = {
  lasers: LaserConfig[];
  difficulty: "easy" | "medium" | "hard" | "ultra-hard";
};
