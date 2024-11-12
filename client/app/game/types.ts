import Phaser from "phaser";

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

// Интерфейс для сцены игры
export interface GameSceneType extends Phaser.Scene {
  player: Phaser.Physics.Arcade.Sprite;
  lasers: Phaser.Physics.Arcade.Group;
  cursor: Phaser.Types.Input.Keyboard.CursorKeys;
  score: number;
  scoreText: Phaser.GameObjects.Text;
  lastPlatformX: number;
  lastBoundsUpdateX: number;
  presetQueue: Preset[];

  // Методы
  enqueuePreset(): void;
  addPresetFromQueue(): void;
  createPreset(preset: Preset): void;
  playerTouchLaser(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    laser: Phaser.Types.Physics.Arcade.GameObjectWithBody
  ): void;
  getRandomDifficulty(): "easy" | "medium" | "hard" | "ultra-hard";
  createLaser(x: number, y: number): void;
}
