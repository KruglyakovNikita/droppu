"use client";

import Phaser from "phaser";
import { easyPresets } from "./presets/easy-presets";
import { mediumPresets } from "./presets/medium-presets";
import { hardPresets } from "./presets/hard-presets";
import { ultraHardPresets } from "./presets/ultra-hard-presets";
import { Preset } from "./presets/types";

const PLAYER_SPEED = 200;
const LASER_GAP_MIN = 400;
const LASER_GAP_MAX = 650;

const MAX_ASCENT_SPEED = -300; // Максимальная скорость подъёма
const MAX_DESCENT_SPEED = 300; // Максимальная скорость падения
const ASCENT_ACCELERATION = -20; // Ускорение вверх при удержании
const DESCENT_ACCELERATION = 20; // Ускорение вниз при падении

class GameScene extends Phaser.Scene {
  player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  lasers!: Phaser.Physics.Arcade.Group;
  cursor!: Phaser.Types.Input.Keyboard.CursorKeys;
  score!: number;
  scoreText!: Phaser.GameObjects.Text;
  lastPlatformX!: number;
  lastBoundsUpdateX: number = 0;

  PLAYER_SPEED = 200;
  LASER_GAP_MIN = 400;
  LASER_GAP_MAX = 650;
  presetQueue: Preset[] = [];

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("laser", "/blocks/laser.png");
    this.load.image("player", "/player/player.png");
    // Инициализация очереди пресетов
    for (let i = 0; i < 3; i++) {
      this.enqueuePreset();
    }
  }

  enqueuePreset() {
    const difficulty = this.getRandomDifficulty();
    let presetPool: Preset[];

    switch (difficulty) {
      case "easy":
        presetPool = easyPresets;
        break;
      case "medium":
        presetPool = mediumPresets;
        break;
      case "hard":
        presetPool = hardPresets;
        break;
      case "ultra-hard":
        presetPool = ultraHardPresets;
        break;
    }

    const preset = Phaser.Utils.Array.GetRandom(presetPool);
    this.presetQueue.push(preset);
  }

  addPresetFromQueue() {
    if (this.presetQueue.length > 0) {
      const preset = this.presetQueue.shift();
      if (preset) {
        this.createPreset(preset);
        this.enqueuePreset(); // Добавляем новый пресет в очередь
      }
    }
  }

  create() {
    // ---User
    this.player = this.physics.add.sprite(20, 100, "player");
    this.player.setBounce(0);
    this.player.setCollideWorldBounds(true);
    this.player.setScrollFactor(1, 0);

    this.cursor = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    }) as Phaser.Types.Input.Keyboard.CursorKeys;

    this.score = 0;
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "24px",
      color: "#ffffff",
    });
    this.scoreText.setScrollFactor(0);

    this.cameras.main.setBounds(-Infinity, 0, Infinity, 400);
    this.cameras.main.startFollow(this.player);

    this.physics.world.setBounds(0, 0, 2500, 400);
    this.player.setVelocityX(PLAYER_SPEED);

    // ---Blocks

    this.lasers = this.physics.add.group({
      allowGravity: false,
      immovable: true,
      // maxSize: 10,
    });

    const initialLasers = 1;
    let laserX = 500;

    for (let i = 0; i < initialLasers; i++) {
      const x = laserX;
      const y = Phaser.Math.Between(60, 340);

      this.createLaser(x, y);
      laserX += Phaser.Math.Between(300, 500);
    }

    this.lastPlatformX = laserX;
    this.physics.add.collider(
      this.player,
      this.lasers,
      this.playerTouchLaser,
      undefined,
      this
    );
  }

  update() {
    //JetPack physic
    if (this.cursor.up.isDown || this.cursor.space.isDown) {
      // Ускоряем подъём при удержании кнопки
      this.player.setVelocityY(
        Phaser.Math.Clamp(
          this.player.body.velocity.y + ASCENT_ACCELERATION,
          MAX_ASCENT_SPEED,
          0
        )
      );
    } else {
      // Ускоряем падение, если кнопка не нажата
      this.player.setVelocityY(
        Phaser.Math.Clamp(
          this.player.body.velocity.y + DESCENT_ACCELERATION,
          0,
          MAX_DESCENT_SPEED
        )
      );
    }

    // ---Player

    const currentScore = Math.max(this.score, Math.floor(this.player.x - 20));
    if (currentScore !== this.score) {
      this.score = currentScore;
      this.scoreText.setText("Score: " + this.score);
    }

    // ---Blocks
    // if (this.player.x > this.lastPlatformX) {
    //   this.addLaser();
    // }
    if (this.player.x > this.lastPlatformX) {
      this.addPresetFromQueue();
    }

    this.lasers.getChildren().forEach((laser) => {
      const laserSprite = laser as Phaser.Physics.Arcade.Sprite;
      // if (laserSprite.x < this.player.x - 1000) {
      //   this.lasers.remove(laserSprite, true, true);
      // }

      if (laserSprite.body) {
        if (laserSprite.x < this.player.x - 500)
          laserSprite.body.enable = false;
        else laserSprite.body.enable = true;
      }
    });

    //Map

    if (this.lastBoundsUpdateX - this.player.x <= 1000) {
      const leftBound = this.player.x - 500;
      const rightBound = this.player.x + 1500;
      this.physics.world.setBounds(leftBound, 0, rightBound, 400);
      this.lastBoundsUpdateX = rightBound; // Обновляем позицию последнего обновления
    }
  }

  createLaser(x: number, y: number) {
    const laser = this.lasers.create(
      x,
      y,
      "laser"
    ) as Phaser.Physics.Arcade.Sprite;

    laser.body!.checkCollision.up = true;
    laser.body!.checkCollision.down = true;
    laser.body!.checkCollision.left = true;
    laser.body!.checkCollision.right = true;
    laser.setImmovable(true);
    laser.setBounce(0);
  }

  playerTouchLaser(player: any, laser: any) {
    this.physics.pause();
    player.setTint(0xff0000);

    // Restart after a delay
    this.time.delayedCall(
      1000,
      () => {
        this.scene.restart();
      },
      [],
      this
    );
  }

  addLaser() {
    const laserGap = Phaser.Math.Between(LASER_GAP_MIN, LASER_GAP_MAX);
    const minY = 60;
    const maxY = 340;

    const x = this.lastPlatformX + laserGap;
    const y = Phaser.Math.Between(minY, maxY);

    this.createLaser(x, y);
    this.lastPlatformX += laserGap;
  }

  addPreset() {
    const difficulty = this.getRandomDifficulty();

    let presetPool: Preset[];
    switch (difficulty) {
      case "easy":
        presetPool = easyPresets;
        break;
      case "medium":
        presetPool = mediumPresets;
        break;
      case "hard":
        presetPool = hardPresets;
        break;
      case "ultra-hard":
        presetPool = ultraHardPresets;
        break;
    }

    const preset = Phaser.Utils.Array.GetRandom(presetPool);

    this.createPreset(preset);
  }

  createPreset(preset: Preset) {
    const baseX = this.lastPlatformX + Phaser.Math.Between(400, 650);

    preset.lasers.forEach((laserConfig) => {
      const x = baseX + laserConfig.x;
      const y = laserConfig.y;
      const angle = laserConfig.angle || 0;
      const length = laserConfig.length || 200; // Длина лазера по умолчанию

      const laser = this.lasers.create(
        x,
        y,
        "laser"
      ) as Phaser.Physics.Arcade.Sprite;
      laser.setOrigin(0.5, 0.5);
      laser.displayHeight = length;
      laser.rotation = Phaser.Math.DegToRad(angle);
      laser.setImmovable(true);
      laser.setBounce(0);
    });

    this.lastPlatformX = baseX; // Обновляем позицию для следующего пресета
  }

  getRandomDifficulty(): "easy" | "medium" | "hard" | "ultra-hard" {
    const distance = this.player?.x ?? 0;
    const difficulties = ["easy", "medium", "hard", "ultra-hard"];
    const weights = [50, 30, 15, 5]; // Начальные вероятности

    // Увеличиваем вероятность сложных пресетов по мере продвижения
    if (distance > 1000) {
      weights[1] += 10; // medium
      weights[0] -= 10; // easy
    }
    if (distance > 2000) {
      weights[2] += 10; // hard
      weights[1] -= 10; // medium
    }
    if (distance > 3000) {
      weights[3] += 10; // ultra-hard
      weights[2] -= 10; // hard
    }

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const randomNum = Phaser.Math.Between(0, totalWeight);

    let cumulativeWeight = 0;
    for (let i = 0; i < difficulties.length; i++) {
      cumulativeWeight += weights[i];
      if (randomNum <= cumulativeWeight) {
        return difficulties[i] as "easy" | "medium" | "hard" | "ultra-hard";
      }
    }

    return "easy";
  }
}

export default GameScene;
