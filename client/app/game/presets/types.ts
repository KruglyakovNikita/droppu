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
