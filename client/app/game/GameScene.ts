"use client";

import Phaser from "phaser";
import {
  DifficultyLevel,
  ObstacleConfig,
  Preset,
  PresetDifficulty,
} from "./presets/types";
import { DynamicRocket } from "./weapons/Rocket/DynamicRocket";
import { HomingRocket } from "./weapons/Rocket/HomingRocket";
import { StaticRocket } from "./weapons/Rocket/StaticRocket";
import { WeaponManager } from "./weapons/WeaponManager";
import { LaserCannon } from "./weapons/Laser/LaserCannon";
import { Rocket } from "./weapons/Rocket/Rocket";
import GameData from "./GameData";
import { coinsPresets } from "./presets/coins-preset";
import { easyPresets } from "./presets/easy-presets";
import { mediumPresets } from "./presets/medium-presets";
import { hardPresets } from "./presets/hard-presets";
import { ultraHardPresets } from "./presets/ultra-hard-presets";
import { getCurrentDifficultyLevel } from "./utils/difficultyLevels";
import {
  ICreatePurchaseAttempt,
  IEndGame,
  IEndGameResponse,
} from "../lib/api/game";
import { ObjectPool } from "./weapons/ObjectPool";

// Константы игры
export const PLAYER_SPEED = 2.5; // Постоянная скорость вправо

export const MIN_DISTANCE_BETWEEN_PRESETS = 175; // Минимальное расстояние между пресетами
const INIT_PLATFORM_DISTANCE = 400;

/**
 * NEW CODE: Мы определим структуру backgroundSets,
 * которая будет хранить массив текстур для каждого ключа "Initial","Intermediate" и т.д.
 * Имеем по 2 изображения, кроме Master, где могут быть 3.
 */
//
//  Initial: ["map/backgrounds/sacura.png", "map/backgrounds/sacura_2.png"],

const backgroundSets: Record<string, string[]> = {
  Initial: ["map/backgrounds/snow_5.png", "map/backgrounds/snow_2.jpg"],
  Intermediate: ["map/backgrounds/snow_5.png", "map/backgrounds/snow_2.jpg"],
  Advanced: ["map/backgrounds/sacura.png", "map/backgrounds/sacura_2.png"],
  Expert: ["map/backgrounds/sacura.png", "map/backgrounds/sacura_2.png"],
  Master: ["map/backgrounds/sacura.png", "map/backgrounds/sacura_2.png"],
};

class GameScene extends Phaser.Scene {
  testInd: number = 0;
  player!: Phaser.Physics.Matter.Sprite;
  lasers: Phaser.Physics.Matter.Sprite[] = [];
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  score!: number;
  // Уберём background1..background4, сделаем массив
  activeBackgrounds: Phaser.GameObjects.Image[] = [];

  scoreText!: Phaser.GameObjects.Text;
  lastPlatformX: number = INIT_PLATFORM_DISTANCE;
  lastBoundsUpdateX: number = 0;

  presetQueue: Preset[] = [];
  isStoped: boolean = false;

  objectManager!: WeaponManager;
  generateRockettimer!: Phaser.Time.TimerEvent | null;
  generateLaserCannonTimer!: Phaser.Time.TimerEvent | null;

  // Coin
  coins: Phaser.Physics.Matter.Image[] = [];
  coinCount: number = 0;
  coinText!: Phaser.GameObjects.Text;

  // For game
  session_id!: number;
  booster!: number;
  userSpriteUrl!: string;
  onGameEnd!: (body: IEndGame) => void;
  handleStartNextGame!: (body: IEndGame) => Promise<IEndGameResponse>;
  onPurchaseAttempt!: (
    body: ICreatePurchaseAttempt
  ) => Promise<"ok" | "canceled">;
  payTicketForGame!: () => Promise<"ok" | "canceled">;
  hasTickets!: boolean;
  gameType!: "paid" | "free";

  // Адаптивные константы
  MIN_Y!: number;
  MAX_Y!: number;
  ASCENT_FORCE!: number;
  DESCENT_ACCELERATION!: number;
  MAX_DESCENT_SPEED!: number;
  MAX_ASCENT_SPEED!: number;

  // Текущее имя сета
  currentSetName: string = "Initial";
  currentSetImageIndex: number = 0;

  //Back
  backgroundSwitchDistance: number = 1000;
  currentBackgroundSet: number = 1;

  //Continue Game
  continueCount: number = 0;
  maxContinues: number = 3;
  purchaseTimer: Phaser.Time.TimerEvent | null = null;
  modalTimeout: Phaser.Time.TimerEvent | null = null;
  isPurchasing: boolean = false;
  purchaseTimeLeft: number = 10;
  purchaseTimeout: number = 10;
  modalTimeoutDuration: number = 30;

  //For hardes game
  lastObstacleTime: number = 0;
  obstacleCooldown: number = 3000; // 3 seconds cooldown between obstacles
  nextObstacleTime: number = 0;

  //Optimize
  coinPool!: ObjectPool<Phaser.Physics.Matter.Image>;
  laserPool!: ObjectPool<Phaser.Physics.Matter.Sprite>;

  fpsText!: Phaser.GameObjects.Text;

  rocketPool!: ObjectPool<Rocket>;

  // Флаги для логики анимаций
  spawnCompleted: boolean = false; // Закончилась ли анимация spawn
  wasInAir: boolean = false; // Был ли персонаж в воздухе на предыдущем кадре (для определения момента приземления)
  isSpawning: boolean = false;
  backpack: Phaser.GameObjects.Sprite | null = null;
  fire: Phaser.GameObjects.Sprite | null = null;

  constructor() {
    super({ key: "GameScene" });
  }

  init() {
    console.log("init");

    const gameData = GameData.instance; // Используем Singleton
    const data = gameData.getData();
    console.log("data", data);

    this.session_id = data.session_id;
    this.booster = data.booster;
    this.userSpriteUrl = data.userSpriteUrl;
    this.onGameEnd = data.onGameEnd;
    this.onPurchaseAttempt = data.onPurchaseAttempt;
    this.payTicketForGame = data.payTicketForGame;
    this.handleStartNextGame = data.handleStartNextGame;
    this.gameType = data.game_type || "paid";
    this.hasTickets = data.hasTickets || false;

    // Устанавливаем адаптивные константы
    this.MIN_Y = this.scale.height * 0.09; // 5% от верха
    this.MAX_Y = this.scale.height * 0.91; // 95% от верха
    this.ASCENT_FORCE = -0.0003 * this.scale.height;
    this.DESCENT_ACCELERATION = 0.0003 * this.scale.height;
    this.MAX_DESCENT_SPEED = 0.01625 * this.scale.height;
    this.MAX_ASCENT_SPEED = -0.01625 * this.scale.height;
  }

  preload() {
    // NEW CODE: подгружаем small_tower.png (для стыка между фонами)
    this.load.image("small_tower", "map/tower/small_tower.png");

    // Подгружаем все фоновые файлы из backgroundSets
    // (можно вручную, либо динамически, ниже — вручную)
    this.load.image("gravity", "map/backgrounds/gravity.png");
    this.load.image("gravity_2", "map/backgrounds/gravity_2.png");
    this.load.image("labaratory", "map/backgrounds/labaratory.png");
    this.load.image("labaratory_2", "map/backgrounds/labaratory_2.png");
    this.load.image("neon", "map/backgrounds/neon.png");
    this.load.image("neon_2", "map/backgrounds/neon_2.png");
    this.load.image("sacura", "map/backgrounds/sacura.png");
    this.load.image("sacura_2", "map/backgrounds/sacura_2.png");
    this.load.image("snow_5", "map/backgrounds/snow_5.png");
    this.load.image("snow_3", "map/backgrounds/snow_3.png");
    this.load.image("snow_2", "map/backgrounds/snow_2.jpg");

    this.load.spritesheet(
      "person_run_sprite",
      `${this.userSpriteUrl}_run.png`,
      {
        frameWidth: 128,
        frameHeight: 256,
      }
    );
    this.load.spritesheet(
      "person_down_sprite",
      `${this.userSpriteUrl}_down.png`,
      {
        frameWidth: 128,
        frameHeight: 256,
      }
    );
    this.load.spritesheet(
      "person_downEnd_sprite",
      `${this.userSpriteUrl}_downEnd.png`,
      {
        frameWidth: 128,
        frameHeight: 256,
      }
    );
    this.load.spritesheet(
      "person_spawn_sprite",
      `${this.userSpriteUrl}_spawn.png`,
      {
        frameWidth: 128,
        frameHeight: 256,
      }
    );
    this.load.spritesheet("person_up_sprite", `${this.userSpriteUrl}_up.png`, {
      frameWidth: 128,
      frameHeight: 256,
    });

    // Загрузка анимированного рюкзака
    this.load.spritesheet(
      "backpack_anim_sprite",
      "/sptires/Backpuck/Backpuck3.png",
      {
        frameWidth: 100, // Ширина кадра рюкзака
        frameHeight: 100, // Высота кадра рюкзака
        endFrame: 3, // Количество кадров (укажите ваше количество)
      }
    );

    // Загрузка анимированного огня
    this.load.spritesheet(
      "fire_up_anim_sprite",
      "/sptires/Backpuck/FireUp3.png",
      {
        frameWidth: 100, // Ширина кадра огня
        frameHeight: 100, // Высота кадра огня
        endFrame: 3, // Количество кадров (укажите ваше количество)
      }
    );
    this.load.spritesheet(
      "fire_end_anim_sprite",
      "/sptires/Backpuck/FireEnd3.png",
      {
        frameWidth: 100, // Ширина кадра огня
        frameHeight: 100, // Высота кадра огня
        endFrame: 5, // Количество кадров (укажите ваше количество)
      }
    );
    this.load.spritesheet("fire_anim_sprite", "/sptires/Backpuck/Fire3.png", {
      frameWidth: 100, // Ширина кадра огня
      frameHeight: 100, // Высота кадра огня
      endFrame: 5, // Количество кадров (укажите ваше количество)
    });

    // Остальные ресурсы уже загружены у вас, оставляем без изменений
    this.load.spritesheet("coin", "/sptires/Coin/Coin-Sheet.png", {
      frameWidth: 40,
      frameHeight: 40,
      margin: 12,
      spacing: 24,
      endFrame: 5,
    });

    // ... остальные загрузки как у вас сейчас ...
    this.load.image("healIcon", "/icons/heal-icon.png");
    this.load.image("back1", "/map/back1.webp");
    this.load.image("back2", "/map/back2.webp");
    this.load.image("back3", "/map/back3.webp");
    this.load.image("back4", "/map/back4.webp");

    this.load.spritesheet("rocket1", "/sptires/rocket2/Rocket1.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet("rocket2", "/sptires/rocket2/Rocket2.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet("rocket3", "/sptires/rocket2/Rocket3.png", {
      frameWidth: 100,
      frameHeight: 100,
    });

    this.load.spritesheet("point1", "/sptires/Point2/Point1.png", {
      frameWidth: 100,
      frameHeight: 100,
      endFrame: 4,
    });
    this.load.spritesheet("point2", "/sptires/Point2/Point2.png", {
      frameWidth: 100,
      frameHeight: 100,
      endFrame: 4,
    });
    this.load.spritesheet("point3", "/sptires/Point2/Point3.png", {
      frameWidth: 100,
      frameHeight: 100,
      endFrame: 4,
    });

    this.load.spritesheet("lazer1", "/sptires/Gun/Lazer1.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet("lazer2", "/sptires/Gun/Lazer2.png", {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet("lazer3", "/sptires/Gun/Lazer3.png", {
      frameWidth: 100,
      frameHeight: 100,
    });

    // Загрузка спрайта лазерной плазмы
    this.load.spritesheet("lazerPlasma", "/sptires/Gun/Lazer-Plasma.png", {
      frameWidth: 20,
      frameHeight: 40,
    });

    this.load.spritesheet("laser", "sptires/static_laser/laserbeam.png", {
      frameWidth: 160,
      frameHeight: 40,
    });

    // Звуки
    this.load.audio("rocketLaunch", "/audio/rocket_start.mp3");
    this.load.audio("playerHit", "/audio/rocket_touch.mp3");

    // Звуки для лазерной пушки
    this.load.audio("laserCannonWarning", "/audio/laser_cannon_start.mp3");
    this.load.audio("laserCannonActivate", "/audio/laser_cannon_touch.mp3");
    this.load.audio("laserCannonDeactivate", "/audio/laser_cannon_start.mp3");
  }

  create() {
    this.anims.create({
      key: "laser_anim",
      frames: this.anims.generateFrameNumbers("laser", { start: 0, end: 5 }),
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: "person_spawn",
      frames: this.anims.generateFrameNumbers("person_spawn_sprite", {
        start: 0,
        end: 14,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: "person_up",
      frames: this.anims.generateFrameNumbers("person_up_sprite", {
        start: 0,
        end: 9,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "person_down",
      frames: this.anims.generateFrameNumbers("person_down_sprite", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "person_downEnd",
      frames: this.anims.generateFrameNumbers("person_downEnd_sprite", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: "person_run",
      frames: this.anims.generateFrameNumbers("person_run_sprite", {
        start: 0,
        end: 9,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.player = this.matter.add.sprite(40, this.MAX_Y, "person_spawn_sprite");
    this.player.setFixedRotation();
    this.player.setIgnoreGravity(true);
    this.player.setFrictionAir(0);
    this.player.setFriction(0);
    this.player.setMass(10);

    const targetWidth = this.scale.width * 0.06;
    const targetHeight = this.scale.height * 0.18;
    this.player.setDisplaySize(targetWidth, targetHeight);
    this.player.setRectangle(this.scale.width * 0.04, this.scale.height * 0.12);

    this.anims.create({
      key: "backpack_idle",
      frames: this.anims.generateFrameNumbers("backpack_anim_sprite", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Создаём анимации для огня
    this.anims.create({
      key: "fire_up_anim",
      frames: this.anims.generateFrameNumbers("fire_up_anim_sprite", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "fire_end_anim",
      frames: this.anims.generateFrameNumbers("fire_end_anim_sprite", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "fire_idle_anim",
      frames: this.anims.generateFrameNumbers("fire_anim_sprite", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Создаём спрайт рюкзака и добавляем его на сцену
    this.backpack = this.add.sprite(
      this.player.x - 15,
      this.player.y,
      "backpack_anim"
    );

    this.backpack.setDisplaySize(
      this.scale.width * 0.024012, // Ширина уменьшена на 10%
      this.scale.height * 0.036 // Высота уменьшена на 20%
    );
    this.backpack.play("backpack_idle");

    // Создаём спрайт огня и добавляем его на сцену, привязывая к рюкзаку
    this.fire = this.add.sprite(
      this.backpack.x,
      this.backpack.y,
      "fire_idle_anim"
    );
    this.fire.setDisplaySize(
      this.scale.width * 0.024012, // Ширина уменьшена на 10%
      this.scale.height * 0.036 // Высота уменьшена на 20%
    );
    this.fire.play("fire_idle_anim");

    this.cursors = this.input.keyboard!.createCursorKeys();

    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.cameras.main.setBounds(
      0,
      0,
      Number.MAX_SAFE_INTEGER,
      this.scale.height
    );

    // Добавляем обработчик для downEnd, чтобы после его завершения переключиться на run
    this.player.on("animationcomplete-person_downEnd", () => {
      // После downEnd переходим обратно в run и восстанавливаем скорость по X
      this.player.setFrictionAir(0);
      this.player.setMass(10);
      this.player.play("person_run");
      this.player.setVelocityX(PLAYER_SPEED);
    });

    // Вызываем spawn
    this.triggerSpawn();

    this.score = 0;
    this.scoreText = this.add
      .text(this.scale.width * 0.02, this.scale.height * 0.02, "Score: 0", {
        fontSize: `${this.scale.height * 0.05}px`,
        color: "#ffffff",
      })
      .setScrollFactor(0);

    this.coinText = this.add
      .text(this.scale.width * 0.02, this.scale.height * 0.08, "Coins: 0", {
        fontSize: `${this.scale.height * 0.05}px`,
        color: "#ffffff",
      })
      .setScrollFactor(0);

    this.activeBackgrounds = [];

    // Начинаем, скажем, с "Initial"
    this.currentSetName = "Initial";
    this.currentSetImageIndex = 0;

    // Добавим несколько фонов подряд (2-3) для заполнения первого экрана
    this.addNextBackground();
    this.addNextBackground();
    this.addNextBackground();

    this.coinPool = new ObjectPool(() => {
      const coin = this.matter.add.sprite(0, 0, "coin");
      coin.setDisplaySize(this.scale.width * 0.045, this.scale.height * 0.075);
      coin.setSensor(true);
      coin.setIgnoreGravity(true);
      coin.setDepth(1);
      coin.setVisible(true);
      coin.play("spin");
      this.coins.push(coin);
      return coin;
    });

    this.laserPool = new ObjectPool(() => {
      // Используем Matter.Sprite для поддержки анимаций
      const laser = this.matter.add.sprite(0, 0, "laser_anim");

      // Запускаем анимацию
      laser.anims.play("laser_anim");

      laser.setSensor(false);
      laser.setActive(false);
      laser.setVisible(false);

      // Устанавливаем размер лазера в игре
      laser.setScale(0.47515); // Масштабируем спрайт-лист для уменьшенной высоты на дополнительные 10%
      laser.setRectangle(
        this.scale.width * 0.13997, // Ширина 160 (неизменна)
        this.scale.height * 0.03350241 // Высота уменьшена ещё на 10%
      );
      return laser;
    });

    this.events.on("playerHit", this.handlePlayerHit, this);

    const currentDifficulty = getCurrentDifficultyLevel(this.score);
    const baseDelay = 10000;
    this.nextObstacleTime =
      this.time.now +
      baseDelay / currentDifficulty.obstacles.spawnRateMultiplier;

    this.fpsText = this.add
      .text(this.scale.width - 100, 10, "", {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setScrollFactor(0);

    // Анимации для других объектов
    this.anims.create({
      key: "spin",
      frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 5 }),
      frameRate: 5,
      repeat: -1,
    });
    this.anims.create({
      key: "rocket_static",
      frames: this.anims.generateFrameNumbers("rocket1", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "rocket_homing",
      frames: this.anims.generateFrameNumbers("rocket2", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "rocket_dynamic",
      frames: this.anims.generateFrameNumbers("rocket3", {
        start: 0,
        end: 5,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "point_static",
      frames: this.anims.generateFrameNumbers("point1", { start: 0, end: 4 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "point_homing",
      frames: this.anims.generateFrameNumbers("point2", { start: 0, end: 4 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "point_dynamic",
      frames: this.anims.generateFrameNumbers("point3", { start: 0, end: 4 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "lazer_static",
      frames: this.anims.generateFrameNumbers("lazer1", { start: 0, end: 10 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "lazer_homing",
      frames: this.anims.generateFrameNumbers("lazer2", { start: 0, end: 10 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "lazer_dynamic",
      frames: this.anims.generateFrameNumbers("lazer3", { start: 0, end: 10 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "lazerPlasma_static",
      frames: this.anims.generateFrameNumbers("lazerPlasma", {
        start: 0,
        end: 1,
      }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: "lazerPlasma_homing",
      frames: this.anims.generateFrameNumbers("lazerPlasma", {
        start: 0,
        end: 1,
      }),
      frameRate: 4,
      repeat: -1,
    });

    this.anims.create({
      key: "lazerPlasma_dynamic",
      frames: this.anims.generateFrameNumbers("lazerPlasma", {
        start: 0,
        end: 1,
      }),
      frameRate: 4,
      repeat: -1,
    });

    this.objectManager = new WeaponManager(this);

    this.cursors = this.input.keyboard!.createCursorKeys();
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(
      0,
      0,
      Number.MAX_SAFE_INTEGER,
      this.scale.height
    );

    this.matter.world.on("collisionstart", this.handleCollision, this);

    // Инициализация очереди пресетов
    for (let i = 0; i < 3; i++) {
      this.enqueuePreset();
    }

    // Добавление начальных пресетов
    for (let i = 0; i < 3; i++) {
      this.addPresetFromQueue();
    }
    GameData.instance.notifyGameReady();
  }

  /**
   * Метод добавления пресета в очередь
   */
  enqueuePreset() {
    const distance = this.player?.x ?? 0;
    const score =
      Math.floor(distance - 100) > 0 ? Math.floor(distance - 100) : 1;

    const currentDifficulty = getCurrentDifficultyLevel(score);

    // Решаем, добавить ли пресет с монетами на основе частоты
    if (Phaser.Math.Between(1, currentDifficulty.coinPresetFrequency) === 1) {
      // Добавляем пресет монет
      const preset = Phaser.Utils.Array.GetRandom(coinsPresets);
      if (preset) {
        this.presetQueue.push(preset);
      }
      return;
    }

    // Добавляем пресет, соответствующий текущей сложности
    const presetPool = this.getPresetPool(currentDifficulty.presetTypes);
    const preset = Phaser.Utils.Array.GetRandom(presetPool);
    if (preset) {
      this.presetQueue.push(preset);
    }
  }

  /**
   * Метод получения пула пресетов на основе типов сложности
   */
  getPresetPool(difficulties: PresetDifficulty[]): Preset[] {
    let pool: Preset[] = [];

    difficulties.forEach((difficulty) => {
      switch (difficulty) {
        case "easy":
          pool = pool.concat(easyPresets);
          break;
        case "medium":
          pool = pool.concat(mediumPresets);
          break;
        case "hard":
          pool = pool.concat(hardPresets);
          break;
        case "ultra-hard":
          pool = pool.concat(ultraHardPresets);
          break;
        default:
          break;
      }
    });

    return pool;
  }

  generateObstacle(currentDifficulty: DifficultyLevel) {
    if (!currentDifficulty.obstacles.obstacleConfigs.length) {
      return; // Нет препятствий на этом уровне сложности
    }

    // Убедимся, что прошло достаточно времени с последнего препятствия
    if (this.time.now - this.lastObstacleTime < this.obstacleCooldown) {
      return;
    }

    this.lastObstacleTime = this.time.now;

    // Настройка задержки для следующего препятствия
    const baseDelay = 10000; // Базовая задержка в миллисекундах
    const adjustedDelay =
      baseDelay / currentDifficulty.obstacles.spawnRateMultiplier;
    this.nextObstacleTime = this.time.now + adjustedDelay;

    // Выбираем конфигурацию препятствия случайным образом на основе весов
    const obstacleConfigs = currentDifficulty.obstacles.obstacleConfigs;
    const totalWeight = obstacleConfigs.reduce(
      (sum, config) => sum + config.weight,
      0
    );
    const rand = Phaser.Math.Between(1, totalWeight);
    let accumulatedWeight = 0;
    let selectedConfig: ObstacleConfig | null = null;

    for (const config of obstacleConfigs) {
      accumulatedWeight += config.weight;
      if (rand <= accumulatedWeight) {
        selectedConfig = config;
        break;
      }
    }

    if (!selectedConfig) {
      console.warn("Конфигурация препятствия не выбрана");
      return;
    }

    // Генерируем препятствие в соответствии с выбранной конфигурацией
    switch (selectedConfig.obstacleType) {
      case "rocket":
        this.generateRocketObstacle(selectedConfig);
        break;
      case "laserCannon":
        this.generateLaserCannonObstacle(selectedConfig);
        break;
      default:
        console.warn(
          `Неизвестный тип препятствия: ${selectedConfig.obstacleType}`
        );
        break;
    }
  }

  generateRocketObstacle(config: ObstacleConfig) {
    config.variants.forEach((variant) => {
      const rocketType = variant.type;
      const initialX =
        this.cameras.main.scrollX + this.cameras.main.width + 100;
      let yPosition: number;

      if (variant.position && variant.position.y) {
        yPosition = this.getYPosition(variant.position.y);
      } else {
        yPosition = Phaser.Math.Between(this.MIN_Y, this.MAX_Y);
      }

      let rocket: Rocket | null = null;

      switch (rocketType) {
        case "static":
          // Если конфигурация подразумевает двойные статичные ракеты сверху и снизу
          if (config.name.includes("double")) {
            rocket = new StaticRocket(this, initialX, yPosition, 3);
          } else {
            // Одиночная статичная ракета
            rocket = new StaticRocket(this, initialX, yPosition, 3);
          }
          break;
        case "homing":
          // Одиночная homing ракета, отслеживающая игрока
          rocket = new HomingRocket(this, initialX, yPosition, this.player, 4);
          break;
        case "dynamic":
          // Одиночная динамическая ракета, отслеживающая игрока
          rocket = new DynamicRocket(
            this,
            initialX,
            yPosition,
            this.player,
            3.5,
            25
          );
          break;
        default:
          console.warn(`Неизвестный тип ракеты: ${rocketType}`);
          break;
      }

      if (rocket) {
        // Устанавливаем предупреждение для ракеты
        if (rocket instanceof HomingRocket || rocket instanceof DynamicRocket) {
          // Для homing и dynamic ракет устанавливаем отслеживание
          rocket.setWarning(
            () => this.cameras.main.scrollX + this.cameras.main.width - 20,
            () => this.player.y
          );
        } else if (rocket instanceof StaticRocket) {
          // Для статичных ракет устанавливаем фиксированное Y
          rocket.setWarning(
            () => this.cameras.main.scrollX + this.cameras.main.width - 20,
            () => yPosition
          );
        }

        this.objectManager.addObject("rocket", rocket, {
          type: rocketType,
          x: rocket.x,
          y: rocket.y,
        });
      }
    });
  }

  generateLaserCannonObstacle(config: ObstacleConfig) {
    config.variants.forEach((variant) => {
      const laserType = variant.type;
      let yPosition: number;

      if (variant.position && variant.position.y) {
        yPosition = this.getYPosition(variant.position.y);
      } else {
        yPosition = Phaser.Math.Between(this.MIN_Y, this.MAX_Y);
      }

      let laserCannon: LaserCannon | null = null;

      if (laserType === "static") {
        // Если конфигурация подразумевает двойные статичные лазеры сверху и снизу
        if (config.name.includes("double")) {
          if (variant.position && typeof variant.position.y === "string") {
            yPosition = this.getYPosition(variant.position.y);
            laserCannon = new LaserCannon(
              this,
              "static",
              this.player,
              yPosition
            );
          } else {
            // Если позиция не указана, выбираем случайную
            laserCannon = new LaserCannon(this, "static", this.player);
          }
        } else {
          // Одиночный статичный лазер
          laserCannon = new LaserCannon(this, "static", this.player, yPosition);
        }
      } else if (laserType === "dynamic" || laserType === "homing") {
        // Для динамических и homing пушек создаём одиночные лазеры, отслеживающие игрока
        laserCannon = new LaserCannon(this, laserType, this.player, yPosition);
      }

      if (laserCannon) {
        this.objectManager.addObject("laserCannon", laserCannon, {
          laserType,
          y: yPosition,
        });
      }
    });
  }

  getYPosition(position: number | "top" | "middle" | "bottom"): number {
    const gameHeight = this.scale.height;
    switch (position) {
      case "top":
        return this.MIN_Y;
      case "middle":
        return gameHeight / 2;
      case "bottom":
        return this.MAX_Y;
      default:
        if (typeof position === "number") {
          return position;
        } else {
          return Phaser.Math.Between(this.MIN_Y, this.MAX_Y);
        }
    }
  }

  /**
   * Метод добавления пресета из очереди
   */
  addPresetFromQueue() {
    if (
      this.presetQueue.length > 0 &&
      this.player.x > this.lastPlatformX - 700
    ) {
      const preset = this.presetQueue.shift();
      if (preset) {
        this.createPreset(preset);
      }
      this.enqueuePreset();
    }
  }

  /**
   * Метод создания пресета лазеров
   * @param preset Пресет для создания лазеров
   */
  createPreset(preset: Preset) {
    let maxOffsetX = 0;
    const heightScale = this.scale.height / 400; // 400 - базовая высота
    preset.lasers.forEach((laserConfig) => {
      const x = this.lastPlatformX + laserConfig.x * this.scale.width; // x now relative
      const y = laserConfig.y * this.scale.height; // y now relative
      const angle = Phaser.Math.DegToRad(laserConfig.angle || 0);

      // Acquire laser from the pool
      const laser = this.laserPool?.acquire();
      if (laser) {
        laser.setPosition(x, y);
        laser.setRotation(angle);

        // Убедитесь, что анимация запущена
        if (!laser.anims.isPlaying) {
          laser.anims.play("laser_anim");
        }

        laser.setActive(true);
        laser.setVisible(true);

        this.lasers.push(laser);
        maxOffsetX = Math.max(maxOffsetX, laserConfig.x * this.scale.width);
      }
    });

    if (preset.coins && this.coinPool) {
      preset.coins.forEach((coinConfig) => {
        const x = this.lastPlatformX + coinConfig.x * this.scale.width;
        const y = coinConfig.y * this.scale.height;

        // Создание коина
        const coin = this.coinPool?.acquire();
        coin.setPosition(x, y);
        this.coins.push(coin);
      });
    }

    // Обновляем позицию последнего пресета
    this.lastPlatformX += maxOffsetX + MIN_DISTANCE_BETWEEN_PRESETS;
  }

  /**
   * Метод обработки столкновений
   * @param event Событие столкновения
   */
  handleCollision(event: Phaser.Physics.Matter.Events.CollisionStartEvent) {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;

      const gameObjectA = bodyA?.gameObject;
      const gameObjectB = bodyB?.gameObject;

      if (!gameObjectA || !gameObjectB) {
        return;
      }

      // Столкновение с коином
      if (
        (gameObjectA === this.player &&
          this.coins.includes(gameObjectB as Phaser.Physics.Matter.Image)) ||
        (gameObjectB === this.player &&
          this.coins.includes(gameObjectA as Phaser.Physics.Matter.Image))
      ) {
        this.handleCoinCollect(
          gameObjectA === this.player ? gameObjectB : gameObjectA
        );
        return;
      }

      // Столкновение с лазером
      if (
        (gameObjectA === this.player &&
          this.lasers.includes(gameObjectB as Phaser.Physics.Matter.Sprite)) ||
        (gameObjectB === this.player &&
          this.lasers.includes(gameObjectA as Phaser.Physics.Matter.Sprite))
      ) {
        console.log("Player hit by laser!");
        this.handlePlayerHit();
        return;
      }

      // Столкновение с ракетой
      if (
        (gameObjectA === this.player &&
          gameObjectB instanceof Rocket &&
          (gameObjectB as Rocket).active) ||
        (gameObjectB === this.player &&
          gameObjectA instanceof Rocket &&
          (gameObjectA as Rocket).active)
      ) {
        console.log("Player hit by rocket!");
        this.handlePlayerHit();
        return;
      }

      // Столкновение с плазмой лазерной пушки
      const laserCannons = this.objectManager.getObjectsByType("laserCannon");

      laserCannons.forEach((cannonObj) => {
        const cannon = cannonObj.instance as LaserCannon;

        cannon.laserPlasma.forEach((segment) => {
          if (
            (gameObjectA === this.player && gameObjectB === segment) ||
            (gameObjectB === this.player && gameObjectA === segment)
          ) {
            this.handlePlayerHit();
          }
        });
      });
    });
  }

  handleCoinCollect(coinObject: Phaser.GameObjects.GameObject) {
    // Удаляем коин
    this.coinPool.release(coinObject as Phaser.Physics.Matter.Image);
    this.coins = this.coins.filter((coin) => coin !== coinObject);
    this.coinCount += 1;
    this.coinText.setText("Coins: " + this.coinCount);
  }

  destroyCoin() {
    this.coinPool.releaseAll();
    this.coins = [];
  }

  drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
    ctx.fill();
  }

  handlePlayerHit() {
    console.log("Player hit detected!");

    if (this.isStoped) return;

    this.isStoped = true;

    // Останавливаем мир
    // Останавливаем физику мира
    this.matter.world.pause();

    // Сохраняем текущие настройки камеры
    const cameraX = this.cameras.main.scrollX;
    const cameraY = this.cameras.main.scrollY;

    // Отключаем автоматическое следование камеры за игроком
    this.cameras.main.stopFollow();

    // Фиксируем камеру на текущей позиции
    this.cameras.main.setScroll(cameraX, cameraY);
    this.player.setTint(0xff0000);

    // Убираем предупреждения
    this.objectManager.objects.forEach((obj) => {
      if (typeof obj.instance.destroyWarning === "function") {
        obj.instance.destroyWarning();
      }
    });

    setTimeout(() => {
      this?.clearGame();
      this?.triggerSpawn();
    }, 50);
    this.showModal();
  }
  /**
   * Метод отображения модального окна с тремя кнопками
   */
  showModal() {
    // Определяем наличие тикетов
    const canContinue = this.continueCount < this.maxContinues;
    const hasTickets = this.hasTickets && this.gameType === "paid";

    // Получаем центр экрана
    const centerY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;
    const centerX = this.cameras.main.worldView.x + this.cameras.main.width / 2;

    // Координаты для трёх кнопок
    const buttonSpacing = 80;
    const continueButtonY = centerY - buttonSpacing;
    const middleButtonY = centerY;
    const finishButtonY = centerY + buttonSpacing;

    const modalElements: Phaser.GameObjects.GameObject[] = [];

    const overlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.75
    );
    overlay.setDepth(1000);
    modalElements.push(overlay);

    // === Кнопка "Продолжить" ===
    if (canContinue) {
      const continueButtonWidth = 260;
      const continueButtonHeight = 60;

      // Создаём градиентную текстуру
      const gradientTexture = this.textures.createCanvas(
        "continueGradient",
        continueButtonWidth,
        continueButtonHeight
      );
      if (gradientTexture) {
        const ctx = gradientTexture.getContext();
        const gradient = ctx.createLinearGradient(
          0,
          0,
          0,
          continueButtonHeight
        );
        gradient.addColorStop(0, "#00008b"); // Темно-синий
        gradient.addColorStop(1, "#1e90ff"); // Светло-синий
        ctx.fillStyle = gradient;
        this.drawRoundedRect(
          ctx,
          0,
          0,
          continueButtonWidth,
          continueButtonHeight,
          12
        );
        gradientTexture.refresh();
      }

      // Создаём кнопку "Продолжить"
      const continueButton = this.add.image(
        centerX,
        continueButtonY,
        "continueGradient"
      );
      continueButton.setInteractive({ useHandCursor: true });
      continueButton.setDepth(1010);
      modalElements.push(continueButton);

      // Пульсирующая обводка для кнопки "Продолжить"
      const continueButtonBorder = this.add.graphics();
      continueButtonBorder.lineStyle(4, 0xff0000, 1);
      continueButtonBorder.strokeRoundedRect(
        centerX - continueButtonWidth / 2,
        continueButtonY - continueButtonHeight / 2,
        continueButtonWidth,
        continueButtonHeight,
        12
      );
      continueButtonBorder.setDepth(1010);
      modalElements.push(continueButtonBorder);

      // Анимация пульсации обводки
      this.tweens.add({
        targets: continueButtonBorder,
        alpha: 0,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      // Текст на кнопке "Продолжить"
      const continueButtonText = this.add
        .text(
          centerX,
          continueButtonY,
          `Продолжить x${this.continueCount + 1}`,
          {
            fontSize: "24px",
            color: "#ffffff",
            fontStyle: "bold",
          }
        )
        .setOrigin(0.5);
      continueButtonText.setDepth(1011);
      modalElements.push(continueButtonText);

      // Иконка хилки рядом с кнопкой
      const healIcon = this.add
        .image(centerX + 110, continueButtonY, "healIcon")
        .setDisplaySize(25, 25)
        .setDepth(1010);
      modalElements.push(healIcon);

      // Создаём кликабельную область поверх всей кнопки
      const interactiveArea = this.add
        .rectangle(
          centerX,
          continueButtonY,
          continueButtonWidth,
          continueButtonHeight,
          0xff0000,
          0 // Полностью прозрачный
        )
        .setInteractive({ useHandCursor: true });
      interactiveArea.setDepth(1016);
      modalElements.push(interactiveArea);

      // Таймер сбоку кнопки "Продолжить"
      const timerCircleRadius = 15;
      const timerCircleX = centerX + 130 - 5;
      const timerCircleY = continueButtonY - 30;

      const timerCircle = this.add
        .circle(timerCircleX, timerCircleY, timerCircleRadius, 0xff0000)
        .setDepth(1013);
      modalElements.push(timerCircle);

      const timerText = this.add
        .text(timerCircleX, timerCircleY, `${this.purchaseTimeLeft}`, {
          fontSize: "16px",
          color: "#ffffff",
        })
        .setOrigin(0.5)
        .setDepth(1014);
      modalElements.push(timerText);

      // Анимация пульсации для круга таймера
      this.tweens.add({
        targets: timerCircle,
        scale: 1.2,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      // Логика таймера и покупки
      this.purchaseTimeLeft = 10;
      this.isPurchasing = false;

      this.purchaseTimer = this.time.addEvent({
        delay: 1000,
        callback: this.createPurchaseTimer,
        args: [
          timerText,
          interactiveArea,
          timerCircle,
          modalElements,
          continueButtonBorder,
          gradientTexture,
        ],
        callbackScope: this,
        loop: true,
      });

      // Обработчик нажатия на кнопку "Продолжить"
      interactiveArea.on("pointerdown", async () => {
        console.log("Continue button clicked.");
        this.isPurchasing = true;

        // Останавливаем таймер
        if (this.purchaseTimer) {
          this.purchaseTimer.paused = true;
        }

        // Вызываем внешнюю функцию покупки
        const continueCost = Math.pow(2, this.continueCount); // Стоимость удваивается каждый раз
        const purchaseResult = await this.onPurchaseAttempt({
          amount: continueCost,
        });

        if (purchaseResult === "ok") {
          // Покупка успешна
          this.continueCount += 1;
          this.closeModal(modalElements);
          this.continueGame();
          this.isPurchasing = false;
        } else {
          // Покупка отменена
          this.isPurchasing = false;

          // Возобновляем таймер
          if (this.purchaseTimer) {
            this.purchaseTimer.paused = false;
          }
        }
      });
    } else {
      // Если достигнуто максимальное количество продолжений, кнопка "Продолжить" отключена
      const continueButtonWidth = 260;
      const continueButtonHeight = 60;

      // Создаём серую текстуру для отключённой кнопки
      const disabledGradientTexture = this.textures.createCanvas(
        "disabledGradient",
        continueButtonWidth,
        continueButtonHeight
      );
      if (disabledGradientTexture) {
        const ctx = disabledGradientTexture.getContext();
        const grad = ctx.createLinearGradient(0, 0, 0, continueButtonHeight);
        grad.addColorStop(0, "#7d87d4"); // Серый оттенок
        grad.addColorStop(1, "#39437d"); // Тёмно-серый оттенок
        ctx.fillStyle = grad;
        this.drawRoundedRect(
          ctx,
          0,
          0,
          continueButtonWidth,
          continueButtonHeight,
          12
        );
        disabledGradientTexture.refresh();
      }

      // Создаём отключённую кнопку "Продолжить"
      const disabledContinueButton = this.add
        .image(centerX, continueButtonY, "disabledGradient")
        .setDepth(1010);
      modalElements.push(disabledContinueButton);

      // Текст на отключённой кнопке
      const disabledContinueText = this.add
        .text(centerX, continueButtonY, `Продолжить x${this.continueCount}`, {
          fontSize: "24px",
          color: "#ffffff",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(1011);
      modalElements.push(disabledContinueText);

      // Иконка хилки на кнопке
      const healIcon = this.add
        .image(centerX + 110, continueButtonY, "healIcon")
        .setDisplaySize(30, 30)
        .setDepth(1010);
      modalElements.push(healIcon);

      // Кнопка не интерактивна, поэтому нет обработчика
    }

    // === Кнопка "Продолжить за тикет" или "Купить тикет и получить монеты" ===
    const middleButtonLabel = hasTickets
      ? "Продолжить за тикет"
      : "Купить тикет и получить монеты";
    const middleButtonTextureKey = hasTickets
      ? "ticketGradient"
      : "buyTicketGradient";

    const middleButtonWidth = 220;
    const middleButtonHeight = 50;

    // Создаём градиентную текстуру для средней кнопки
    const middleTexture = this.textures.createCanvas(
      middleButtonTextureKey,
      middleButtonWidth,
      middleButtonHeight
    );
    if (middleTexture) {
      const ctx = middleTexture.getContext();
      const grad = ctx.createLinearGradient(0, 0, 0, middleButtonHeight);
      if (hasTickets) {
        grad.addColorStop(0, "#2e8b57"); // Темно-зелёный
        grad.addColorStop(1, "#3cb371"); // Светло-зелёный
      } else {
        grad.addColorStop(0, "#ff7f50"); // Коралловый
        grad.addColorStop(1, "#ff6347"); // Томатный
      }
      ctx.fillStyle = grad;
      this.drawRoundedRect(
        ctx,
        0,
        0,
        middleButtonWidth,
        middleButtonHeight,
        10
      );
      middleTexture.refresh();
    }

    // Создаём среднюю кнопку
    const middleButton = this.add
      .image(centerX, middleButtonY, middleButtonTextureKey)
      .setDepth(1010);
    middleButton.setInteractive({ useHandCursor: true });
    modalElements.push(middleButton);

    // Добавляем текст на среднюю кнопку
    const middleButtonText = this.add
      .text(centerX, middleButtonY, middleButtonLabel, {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(1011);
    modalElements.push(middleButtonText);

    // Обработчик нажатия на среднюю кнопку
    middleButton.on("pointerdown", async () => {
      if (hasTickets) {
        // Продолжить за тикет
        console.log("Continue with ticket button clicked.");
        await this.startNextGame();
        this.closeModal(modalElements);
      } else {
        // Купить тикет и получить монеты
        console.log("Buy ticket button clicked.");
        await this.payTicketForGameHandler(modalElements);
      }
    });

    // === Кнопка "Закончить игру" ===
    const finishButtonWidth = 200;
    const finishButtonHeight = 50;

    // Создаём градиентную текстуру для кнопки "Закончить игру"
    const finishTexture = this.textures.createCanvas(
      "finishGradient",
      finishButtonWidth,
      finishButtonHeight
    );
    if (finishTexture) {
      const ctx = finishTexture.getContext();
      const grad = ctx.createLinearGradient(0, 0, 0, finishButtonHeight);
      grad.addColorStop(0, "#808080"); // Серый
      grad.addColorStop(1, "#666666"); // Тёмно-серый
      ctx.fillStyle = grad;
      this.drawRoundedRect(
        ctx,
        0,
        0,
        finishButtonWidth,
        finishButtonHeight,
        10
      );
      finishTexture.refresh();
    }

    // Создаём кнопку "Закончить игру"
    const finishButton = this.add
      .image(centerX, finishButtonY, "finishGradient")
      .setDepth(1010);
    finishButton.setInteractive({ useHandCursor: true });
    modalElements.push(finishButton);

    // Добавляем текст на кнопку "Закончить игру"
    const finishButtonText = this.add
      .text(centerX, finishButtonY, "Закончить игру", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5)
      .setDepth(1011);
    modalElements.push(finishButtonText);

    // Обработчик нажатия на кнопку "Закончить игру"
    finishButton.on("pointerdown", () => {
      this.closeModal(modalElements);
      this.onGameEnd({
        score: this.score,
        coins_earned: this.coinCount,
        session_id: this.session_id,
        // При обычном завершении без тикета isPaid:false
        isPaid: false,
      });
      this.isStoped = true;
    });
  }

  async startNextGame() {
    // Завершаем текущую игру и отправляем данные на сервер
    const response = await this.handleStartNextGame({
      score: this.score,
      coins_earned: this.coinCount,
      session_id: this.session_id,
      isPaid: true, // Указываем, что использовался тикет
    });
    console.log("RESPONSE");
    console.log(response);

    if (response?.session_id) {
      // Очищаем текущую игру
      this.clearGame();
      this.triggerSpawn();

      // Сброс позиции генерации препятствий
      this.lastPlatformX = INIT_PLATFORM_DISTANCE;

      // Устанавливаем новый session_id
      this.session_id = response.session_id;

      // Сбрасываем параметры игры
      this.score = 0;
      this.coinCount = 0;

      // Очищаем объекты
      this.objectManager.removeAllObjects();
      this.coins = [];
      this.lasers = [];
      this.presetQueue = [];

      // Перезапускаем игру
      this.scene.restart();
    } else {
      console.error("Failed to start the next game.");
    }
  }
  // Новая функция для оплаты тикета
  async payTicketForGameHandler(
    modalElements: Phaser.GameObjects.GameObject[]
  ) {
    // Вызываем onPurchaseAttempt
    const purchaseResult = await this.payTicketForGame();

    if (purchaseResult === "ok") {
      // Покупка успешна, завершаем игру с isPaid:true и уникальным payment_id
      this.closeModal(modalElements);
      this.onGameEnd({
        score: this.score,
        coins_earned: this.coinCount,
        session_id: this.session_id,
        isPaid: true,
      });
      this.isStoped = true;
    } else {
      // Покупка отменена, ничего не делаем, оставляем игрока в модалке
      console.log("Ticket purchase canceled");
    }
  }

  createPurchaseTimer(
    timerText: Phaser.GameObjects.Text,
    continueButton: Phaser.GameObjects.Rectangle,
    timerCircle: Phaser.GameObjects.Arc,
    modalElements: Phaser.GameObjects.GameObject[],
    continueButtonBorder: Phaser.GameObjects.Graphics,
    gradientTexture: Phaser.Textures.CanvasTexture
  ) {
    if (
      !timerText ||
      !continueButton ||
      !timerCircle ||
      !modalElements ||
      !continueButtonBorder ||
      !gradientTexture
    ) {
      console.error("Ошибка: Один из параметров не определён!");
      return;
    }

    console.log("Таймер запущен:", this.purchaseTimeLeft);

    if (!this.isPurchasing) {
      this.purchaseTimeLeft -= 1;

      // Обновляем текст таймера
      if (this.purchaseTimeLeft > 0) {
        console.log("Оставшееся время:", this.purchaseTimeLeft);
        timerText.setText(`${this.purchaseTimeLeft}`);
      } else {
        console.log("Время вышло");

        // Время вышло
        this.purchaseTimer?.remove(false);
        this.purchaseTimer = null;

        // Блокируем кнопку покупки и делаем её серой
        continueButton.disableInteractive();
        timerText.setText("✖");
        timerCircle.setFillStyle(0x6b7096, 1);

        // Изменяем обводку кнопки на серый цвет
        continueButtonBorder.clear();
        continueButtonBorder.lineStyle(4, 0x7d87d4, 0.6); // Серый цвет обводки
        continueButtonBorder.strokeRoundedRect(
          continueButton.x - continueButton.displayWidth / 2,
          continueButton.y - continueButton.displayHeight / 2,
          continueButton.displayWidth,
          continueButton.displayHeight,
          12
        );

        // Изменяем градиент кнопки на серые тона
        const gradientCtx = gradientTexture.getContext();
        const newGradient = gradientCtx.createLinearGradient(
          0,
          0,
          0,
          gradientTexture.height
        );
        newGradient.addColorStop(1, "#39437d"); // Светло-серый
        newGradient.addColorStop(0, "#0d0f1f"); // Тёмно-серый
        gradientCtx.fillStyle = newGradient;
        this.drawRoundedRect(
          gradientCtx,
          0,
          0,
          gradientTexture.width,
          gradientTexture.height,
          12
        );
        gradientTexture.refresh();

        // Таймер закрытия модалки через 30 секунд
        this.modalTimeout = this.time.delayedCall(
          30000,
          () => {
            this.closeModal(modalElements);
            this.onGameEnd({
              score: this.score,
              coins_earned: this.coinCount,
              session_id: this.session_id,
            });
          },
          undefined,
          this
        );
      }
    }
  }

  closeModal(elements: Phaser.GameObjects.GameObject[]) {
    elements.forEach((element) => {
      if (element) {
        element.destroy();
      }
    });
    // Останавливаем таймеры
    this.purchaseTimer?.remove(false);
    this.purchaseTimer = null;

    this.modalTimeout?.remove(false);
    this.modalTimeout = null;

    this.isPurchasing = false;
    this.isStoped = false;
  }

  clearGame() {
    // Очистка старых объектов и таймеров
    this.objectManager.removeAllObjects();

    // Останавливаем анимации лазеров
    this.lasers.forEach((laser) => {
      laser.anims.stop(); // Останавливаем анимацию
    });
    this.lasers = [];
    this.laserPool.destroyAll();

    // Удаляем спрайты рюкзака и огня
    if (this.backpack) {
      this.backpack.destroy();
    }
    if (this.fire) {
      this.fire.destroy();
    }

    this.destroyCoin();
  }

  continueGame() {
    this.player.clearTint();

    this.matter.world.resume();
    this.isStoped = false;
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    // Перезапуск таймеров генерации препятствий
    //////TEST
    // this.generateRocketsByTimer();
    // this.generateLaserCannonsByTimer();
  }

  triggerSpawn() {
    this.isSpawning = true;
    this.spawnCompleted = false;
    this.player.setVelocityX(0);
    this.player.setY(this.MAX_Y);
    this.player.setIgnoreGravity(true);
    this.player.setFrictionAir(0);
    this.player.setFriction(0);
    this.player.setMass(10);
    this.player.play("person_spawn");

    this.player.once(Phaser.Animations.Events.ANIMATION_COMPLETE, (anim) => {
      if (anim.key === "person_spawn") {
        this.spawnCompleted = true;
        this.isSpawning = false;
        this.player.setVelocityX(PLAYER_SPEED);
        this.player.setFixedRotation();
        this.player.setIgnoreGravity(true);
        this.player.setFrictionAir(0);
        this.player.setFriction(0);
        this.player.setMass(10);
        this.updateAnimationState();
        this.player.play("person_run");
      }
    });
  }

  /**
   * addNextBackground: Создаёт очередной фон (возможно, с tower) справа от последнего.
   */
  addNextBackground() {
    // Берём список изображений для текущего уровня (Initial / Intermediate / etc.)
    const arr = backgroundSets[this.currentSetName] || [];
    if (arr.length === 0) return;

    // Выбираем имя файла (например "map/backgrounds/gravity.png")
    const fileFullName = arr[this.currentSetImageIndex];

    // 1) Находим правый край последнего фона
    let rightEdgeX = 0;
    if (this.activeBackgrounds.length > 0) {
      const lastBg = this.activeBackgrounds[this.activeBackgrounds.length - 1];
      rightEdgeX = lastBg.x + lastBg.displayWidth;
    }

    // 2) Ставим столб (small_tower) как «стык» (по центру в X = rightEdgeX)
    const tower = this.add.image(rightEdgeX - 15, 0, "small_tower");
    tower.setDepth(-100); // фон/столб за другими объектами
    tower.setOrigin(0.2, 1);
    tower.setY(this.scale.height); // крепим низ столба к низу экрана

    // 3) Следующий фон пусть начинается чуть правее столба
    const nextBgX = rightEdgeX;

    // 4) Создаём сам фон
    const newBgKey = this.extractKeyFromPath(fileFullName);
    const newBg = this.add.image(nextBgX, this.scale.height, newBgKey);

    // НЕ вызываем setScrollFactor(0), чтобы фон скроллился при движении камеры
    // newBg.setScrollFactor(1); // по умолчанию 1
    newBg.setOrigin(1, 1);

    newBg.setDepth(-10000);
    newBg.setDisplaySize(
      this.scale.width * 1.555, // Пропорциональная ширина для уменьшенной высоты
      this.scale.height * 1
    );

    this.activeBackgrounds.push(newBg);

    // Меняем индекс (если дошли до конца массива, возвращаемся к 0)
    this.currentSetImageIndex++;
    if (this.currentSetImageIndex >= arr.length) {
      this.currentSetImageIndex = 0;
      // Можно ещё переключиться на другой setName (в зависимости от score).
      const level = getCurrentDifficultyLevel(this.score);
      this.currentSetName = level.name;
    }
  }

  // ...

  extractKeyFromPath(path: string): string {
    const baseName = path.split("/").pop() || "";
    const noExt = baseName.split(".")[0];
    return noExt;
  }

  /**
   * Метод обновления сцены
   */
  update() {
    const fps = Math.floor(this.game.loop.actualFps);
    this.fpsText.setText(`FPS: ${fps}`);

    if (this.isStoped) return;

    if (this.objectManager) {
      this.objectManager.update(this.player);
    }

    if (this.isSpawning) {
      return;
    }

    if (this.spawnCompleted) {
      this.updateAnimationState();
    }

    if (
      this.cursors.up.isDown ||
      this.cursors.space.isDown ||
      this.input.activePointer.isDown
    ) {
      const newVelocityY = Math.max(
        (this.player.body?.velocity.y ?? 0) + this.ASCENT_FORCE,
        this.MAX_ASCENT_SPEED
      );
      this.player.setVelocityY(newVelocityY);
    } else {
      const newVelocityY = Math.min(
        (this.player.body?.velocity.y ?? 0) + this.DESCENT_ACCELERATION,
        this.MAX_DESCENT_SPEED
      );
      this.player.setVelocityY(newVelocityY);
    }

    if (this.player.y < this.MIN_Y) {
      this.player.setY(this.MIN_Y);
      this.player.setVelocityY(0);
    } else if (this.player.y > this.MAX_Y) {
      this.player.setY(this.MAX_Y);
      this.player.setVelocityY(0);
    }

    const scrollSpeed = PLAYER_SPEED;
    this.cameras.main.scrollX += scrollSpeed;

    const onGround = this.player.y >= this.MAX_Y - 1;
    const wasOnGround = !this.wasInAir;
    const nowInAir = !onGround;

    if (wasOnGround && nowInAir) {
      this.wasInAir = true;
    } else if (!wasOnGround && !nowInAir) {
      if (this.wasInAir) {
        // Приземлились - включаем downEnd
        this.player.play(`person_downEnd`);
      }
      this.wasInAir = false;
    }

    // Обновляем счёт
    const distance = this.player?.x ?? 0;
    const score = Math.floor(distance - 100);
    if (score > this.score) {
      this.score = score;
      this.scoreText.setText("Score: " + this.score);
    }

    if (this.time.now >= this.nextObstacleTime) {
      const currentDifficulty = getCurrentDifficultyLevel(this.score);
      this.generateObstacle(currentDifficulty);
    }

    this.cameras.main.scrollX += scrollSpeed;

    // Проверяем, не нужно ли добавить очередной фон
    if (this.activeBackgrounds.length > 0) {
      const lastBg = this.activeBackgrounds[this.activeBackgrounds.length - 1];
      const cameraRight = this.cameras.main.scrollX + this.cameras.main.width;
      // Если последний фон закончился недалеко от камеры => добавляем фон
      if (lastBg.x <= cameraRight + 200) {
        this.addNextBackground();
      }
    }

    // Удаляем те фоны, которые ушли далеко слева
    this.activeBackgrounds = this.activeBackgrounds.filter((bg) => {
      if (bg.x + bg.displayWidth < this.cameras.main.scrollX - 200) {
        bg.destroy();
        return false;
      }
      return true;
    });

    this.addPresetFromQueue();

    this.lasers = this.lasers.filter((laser) => {
      if (
        laser &&
        this.cameras?.main?.scrollX !== undefined &&
        laser?.x < this.cameras.main.scrollX - 100
      ) {
        this.laserPool.release(laser);
        return false;
      }
      return true;
    });

    this.coins = this.coins.filter((coin) => {
      if (coin && coin?.x < this.cameras.main.scrollX - 100) {
        this.coinPool.release(coin);
        return false;
      }
      return true;
    });

    if (this.backpack) {
      // Обновляем позиции рюкзака и огня относительно персонажа
      this.backpack.x = this.player.x - 15; // Настройте смещение по X
      this.backpack.y = this.player.y; // Настройте смещение по Y
      if (this.fire) {
        this.fire.x = this.backpack.x;
        this.fire.y = this.backpack.y; // Огонь ниже рюкзака, настройте смещение по Y
      }
    }

    // Управление анимациями огня на основе состояния персонажа
    const playerVelocityY = this.player.body?.velocity.y ?? 0;

    if (playerVelocityY < -0.5 && this.fire) {
      // Взлёт (скорость вверх)
      if (this.fire.anims.currentAnim?.key !== "fire_up_anim") {
        this.fire.play("fire_up_anim", true);
      }
    } else if (playerVelocityY > 0.5 && playerVelocityY < 0.1 && this.fire) {
      // Снижение (скорость вниз)
      if (this.fire.anims.currentAnim?.key !== "fire_end_anim") {
        this.fire.play("fire_end_anim", true);
      }
    } else if (playerVelocityY <= 0.15 && this.fire) {
      this.fire.play("fire_up_anim", false);
    } else if (this.fire) {
      // Покой
      if (this.fire.anims.currentAnim?.key !== "fire_idle_anim") {
        this.fire.play("fire_idle_anim", true);
      }
    }
  }

  updateAnimationState() {
    if (!this.spawnCompleted) return;

    const onGround = this.player.y >= this.MAX_Y - 1;
    const vy = this.player.body?.velocity.y ?? 0;
    const topThreshold = 10;
    const nearTop = this.player.y < this.MIN_Y + topThreshold;

    if (onGround) {
      const currentAnim = this.player.anims.currentAnim?.key;
      if (currentAnim !== `person_downEnd` && currentAnim !== `person_spawn`) {
        if (currentAnim !== `person_run`) {
          this.player.setFrictionAir(0);
          this.player.setMass(10);
          this.player.play(`person_run`);
        }
      }
    } else {
      if (vy < 0) {
        if (this.player.anims.currentAnim?.key !== `person_up`) {
          this.player.play(`person_up`);
        }
      } else {
        if (nearTop) {
          if (this.player.anims.currentAnim?.key !== `person_up`) {
            this.player.play(`person_up`);
          }
        } else {
          if (this.player.anims.currentAnim?.key !== `person_down`) {
            this.player.play(`person_down`);
          }
        }
      }
    }
  }

  /**
   * Метод переключения на новый набор фонов
   */
  // switchBackgrounds() {
  //   if (this.currentBackgroundSet === 1) {
  //     // Создаем новые фоны для второго набора за пределами экрана справа
  //     this.background3 = this.add.image(
  //       this.background2.x + this.background2.displayWidth + 400,
  //       0,
  //       "back3"
  //     );
  //     this.background3.setDisplaySize(this.scale.width, this.scale.height);
  //     this.background4 = this.add.image(
  //       this.background3.displayWidth,
  //       0,
  //       "back4"
  //     );

  //     // Масштабируем изображения до размеров экрана
  //     this.background4.setDisplaySize(this.scale.width, this.scale.height);

  //     // Устанавливаем оба изображения в верхний левый угол и закрепляем на заднем плане
  //     this.background3.setOrigin(0, 0).setScrollFactor(0).setDepth(-Infinity);
  //     this.background4.setOrigin(0, 0).setScrollFactor(0).setDepth(-Infinity);

  //     // Обновляем текущий набор фонов
  //     this.currentBackgroundSet = 2;

  //     console.log("Switched to Background Set 2");
  //   } else if (this.currentBackgroundSet === 2) {
  //     // Создаем новые фоны для первого набора за пределами экрана справа
  //     this.background1 = this.add.image(this.scale.width, 0, "back1");
  //     this.background2 = this.add.image(this.scale.width * 2, 0, "back2");

  //     // Масштабируем изображения до размеров экрана
  //     this.background1.setDisplaySize(this.scale.width, this.scale.height);
  //     this.background2.setDisplaySize(this.scale.width, this.scale.height);

  //     // Устанавливаем оба изображения в верхний левый угол и закрепляем на заднем плане
  //     this.background1.setOrigin(0, 0).setScrollFactor(0).setDepth(-Infinity);
  //     this.background2.setOrigin(0, 0).setScrollFactor(0).setDepth(-Infinity);

  //     // Обновляем текущий набор фонов
  //     this.currentBackgroundSet = 1;

  //     console.log("Switched to Background Set 1");
  //   }
  // }
}

export default GameScene;
