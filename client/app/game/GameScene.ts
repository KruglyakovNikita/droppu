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
  ICreatePayTicketAttempt,
  ICreatePurchaseAttempt,
  IEndGame,
  IEndGameResponse,
} from "../lib/api/game";
import { ObjectPool } from "./weapons/ObjectPool";

// Константы игры
export const PLAYER_SPEED = 2.5; // Постоянная скорость вправо

export const MIN_DISTANCE_BETWEEN_PRESETS = 175; // Минимальное расстояние между пресетами
const INIT_PLATFORM_DISTANCE = 400;
class GameScene extends Phaser.Scene {
  testInd: number = 0;
  player!: Phaser.Physics.Matter.Sprite;
  lasers: Phaser.Physics.Matter.Image[] = [];
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  score!: number;
  background1!: Phaser.GameObjects.Image;
  background2!: Phaser.GameObjects.Image;
  background3!: Phaser.GameObjects.Image;
  background4!: Phaser.GameObjects.Image;

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
  userSkinUrl!: string;
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
  laserPool!: ObjectPool<Phaser.Physics.Matter.Image>;

  fpsText!: Phaser.GameObjects.Text;

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
    this.userSkinUrl = data.userSkinUrl;
    this.userSpriteUrl = data.userSpriteUrl;
    this.onGameEnd = data.onGameEnd;
    this.onPurchaseAttempt = data.onPurchaseAttempt;
    this.payTicketForGame = data.payTicketForGame;
    this.handleStartNextGame = data.handleStartNextGame;
    this.gameType = data.game_type || "paid";
    this.hasTickets = data.hasTickets || false;

    // Устанавливаем адаптивные константы
    this.MIN_Y = this.scale.height * 0.05; // 5% от верха
    this.MAX_Y = this.scale.height * 0.95; // 95% от верха
    this.ASCENT_FORCE = -0.0003 * this.scale.height;
    this.DESCENT_ACCELERATION = 0.0003 * this.scale.height;
    this.MAX_DESCENT_SPEED = 0.01625 * this.scale.height;
    this.MAX_ASCENT_SPEED = -0.01625 * this.scale.height;
  }

  preload() {
    // Загрузка спрайтов для анимаций
    this.load.spritesheet("playerRun", this.userSpriteUrl, {
      frameWidth: 128, // Ширина кадра
      frameHeight: 204, // Высота кадра
    });

    // Загрузка коинов
    this.load.spritesheet("coin", "/blocks/coin-sprite.png", {
      frameWidth: 20, // Ширина кадра
      frameHeight: 20, // Высота кадра
    });

    this.load.image("healIcon", "/icons/heal-icon.png");

    // Загрузка других ресурсов
    this.load.image("laser", "/blocks/laser.png");
    this.load.image("back1", "/map/back1.webp"); // Замените пути на ваши файлы
    this.load.image("back2", "/map/back2.webp");
    this.load.image("back3", "/map/back3.webp");
    this.load.image("back4", "/map/back4.webp");

    // Текстуры для ракет
    this.load.image("homingRocketTexture", "/blocks/rocket_default_homing.png");
    this.load.image("staticRocketTexture", "/blocks/rocket_default.png");
    this.load.image(
      "dynamicRocketTexture",
      "/blocks/rocket_default_dynamic.png"
    );

    // Текстура для дыма
    this.load.image("smoke", "/blocks/smoke.png");

    // Звуки
    this.load.audio("rocketLaunch", "/audio/rocket_start.mp3");
    this.load.audio("playerHit", "/audio/rocket_touch.mp3");

    // Предупреждающий треугольник
    this.load.image("warningTriangle", "/blocks/warningTriangle.png");
    this.load.image("laserGun", "/blocks/laser_gun.png");
    this.load.image("laserPlazm", "/blocks/laser_plazm.png");

    // Звуки для лазерной пушки
    this.load.audio("laserCannonWarning", "/audio/laser_cannon_start.mp3");
    this.load.audio("laserCannonActivate", "/audio/laser_cannon_touch.mp3");
    this.load.audio("laserCannonDeactivate", "/audio/laser_cannon_start.mp3");

    // Если userSpriteUrl передан, загружаем пользовательский спрайт
    if (this.userSpriteUrl) {
      this.load.image("userSprite", this.userSpriteUrl);
    }
  }

  create() {
    console.log("create");
    // Создание анимации бега
    this.anims.create({
      key: "run",
      frames: this.anims.generateFrameNumbers("playerRun", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // Создание анимации вращения для коинов
    this.anims.create({
      key: "spin",
      frames: this.anims.generateFrameNumbers("coin", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.objectManager = new WeaponManager(this);

    // Создаем игрока с физикой Matter
    if (!this.userSpriteUrl) {
      this.player = this.matter.add.sprite(128, 204, "userSprite");
    } else {
      this.player = this.matter.add.sprite(100, 200, "playerRun");
      this.player.play("run");
    }

    this.player.setFixedRotation();
    this.player.setIgnoreGravity(true);
    this.player.setFrictionAir(0);
    this.player.setFriction(0);
    this.player.setMass(10);

    // Масштабируем игрока
    const targetWidth = this.scale.width * 0.05;
    const targetHeight = this.scale.height * 0.1;
    const scaleX = targetWidth / this.player.width;
    const scaleY = targetHeight / this.player.height;
    this.player.setScale(scaleX, scaleY);
    // // Then adjust the body size
    // this.player.setBody({
    //   type: "rectangle",
    //   width: this.player.displayWidth,
    //   height: this.player.displayHeight,
    // });

    // Настройка управления
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Настройка камеры
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(
      0,
      0,
      Number.MAX_SAFE_INTEGER,
      this.scale.height
    );

    // Установка начальной постоянной скорости вправо
    this.player.setVelocityX(PLAYER_SPEED);

    // Обработка столкновений
    this.matter.world.on("collisionstart", this.handleCollision, this);

    // Создаем два изображения для плавной бесконечной прокрутки
    // Создаем два изображения для плавной бесконечной прокрутки
    this.background1 = this.add.image(0, 0, "back1");
    // Масштабируем изображения до размеров экрана
    this.background1.setDisplaySize(this.scale.width, this.scale.height);

    this.background2 = this.add.image(
      +this.background1.displayWidth,
      0,
      "back2"
    );
    this.background2.setDisplaySize(this.scale.width, this.scale.height);

    // Устанавливаем оба изображения в верхний левый угол и закрепляем на заднем плане
    this.background1.setOrigin(0, 0).setScrollFactor(0).setDepth(-Infinity);
    this.background2.setOrigin(0, 0).setScrollFactor(0).setDepth(-Infinity);

    // Настройка счета
    this.score = 0;
    this.scoreText = this.add.text(
      this.scale.width * 0.02,
      this.scale.height * 0.02,
      "Score: 0",
      { fontSize: `${this.scale.height * 0.05}px`, color: "#ffffff" }
    );
    this.scoreText.setScrollFactor(0);

    // Настройка счета коинов
    this.coinText = this.add.text(
      this.scale.width * 0.02,
      this.scale.height * 0.08,
      "Coins: 0",
      { fontSize: `${this.scale.height * 0.05}px`, color: "#ffffff" }
    );
    this.coinText.setScrollFactor(0);

    // СОЗДАНИЕ ПРЕПЯТСТВИЙ
    this.coinPool = new ObjectPool(() => {
      const coin = this.matter.add.sprite(0, 0, "coin");
      coin.setDisplaySize(this.scale.width * 0.03, this.scale.height * 0.05);
      coin.setSensor(true); // Устанавливаем как сенсор
      coin.setIgnoreGravity(true); // Игнорируем гравитацию
      coin.setDepth(1); // Устанавливаем слой отрисовки
      coin.setVisible(true); // Делаем монеты видимыми

      coin.play("spin"); // Запускаем анимацию
      this.coins.push(coin);
      return coin;
    });

    const heightScale = this.scale.height / 400;

    this.laserPool = new ObjectPool(() => {
      const laser = this.matter.add.image(0, 0, "laser", undefined, {
        isStatic: true,
      });

      laser.setSensor(false);
      laser.setActive(false);
      laser.setVisible(false);
      return laser;
    });

    // Инициализация очереди пресетов
    for (let i = 0; i < 3; i++) {
      this.enqueuePreset();
    }

    // Добавление начальных пресетов
    for (let i = 0; i < 3; i++) {
      this.addPresetFromQueue();
    }

    this.events.on("playerHit", this.handlePlayerHit, this);

    // Инициализация таймера препятствий
    const currentDifficulty = getCurrentDifficultyLevel(this.score);
    const baseDelay = 10000;
    this.nextObstacleTime =
      this.time.now +
      baseDelay / currentDifficulty.obstacles.spawnRateMultiplier;

    this.fpsText = this.add.text(this.scale.width - 100, 10, "", {
      fontSize: "16px",
      color: "#ffffff",
    });
    this.fpsText.setScrollFactor(0);
    GameData.instance.notifyGameReady();
  }

  /**
   * Метод добавления пресета в очередь
   */
  enqueuePreset() {
    const distance = this.player?.x ?? 0;
    const score = Math.floor(distance - 100);
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
          rocket = new HomingRocket(this, initialX, yPosition, this.player, 5);
          break;
        case "dynamic":
          // Одиночная динамическая ракета, отслеживающая игрока
          rocket = new DynamicRocket(
            this,
            initialX,
            yPosition,
            this.player,
            4,
            20
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
    const cameraScrollX = this.cameras.main.scrollX;

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
    console.log("heightScale", heightScale);

    preset.lasers.forEach((laserConfig) => {
      const x = this.lastPlatformX + laserConfig.x * this.scale.width; // x now relative
      const y = laserConfig.y * this.scale.height; // y now relative
      const angle = Phaser.Math.DegToRad(laserConfig.angle || 0);
      const laserLength = 80 * heightScale;

      // Acquire laser from the pool
      const laser = this.laserPool?.acquire();
      if (laser) {
        laser.setPosition(x, y);
        laser.setRotation(angle);
        laser.setDisplaySize(25, laserLength);
        laser.setSize(25, laserLength);
        console.log(laserLength);

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
    console.log("Collision detected!");

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
          this.lasers.includes(gameObjectB as Phaser.Physics.Matter.Image)) ||
        (gameObjectB === this.player &&
          this.lasers.includes(gameObjectA as Phaser.Physics.Matter.Image))
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

    setTimeout(() => this.clearGame(), 50);
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
        .image(centerX + 130, continueButtonY, "healIcon")
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
    // Предположим стоимость тикета фиксированная, или равноценна какому-то значению.
    // Можно определить cost = 1 или любой другой механизм.
    const ticketCost = 1; // например, 1 единица условной валюты

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
    this.lasers = [];
    this.laserPool.releaseAll();
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

  /**
   * Метод обновления сцены
   */
  update() {
    const fps = Math.floor(this.game.loop.actualFps);
    this.fpsText.setText(`FPS: ${fps}`);

    if (this.isStoped) {
      return;
    }

    // Обновляем все объекты
    if (this.objectManager) {
      this.objectManager.update(this.player);
    }

    // Обновляем счёт
    const distance = this.player?.x ?? 0;
    const score = Math.floor(distance - 100);
    this.score = Math.max(this.score, score);
    this.scoreText.setText("Score: " + this.score);

    const currentDifficulty = getCurrentDifficultyLevel(this.score);

    // Генерируем препятствия на основе текущей сложности
    if (this.time.now >= this.nextObstacleTime) {
      this.generateObstacle(currentDifficulty);
    }

    // Прокручиваем фон
    this.scrollBackgrounds();

    // Постоянная скорость вправо
    this.player.setVelocityX(PLAYER_SPEED);

    // Управление полетом
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

    // Добавляем пресеты из очереди
    this.addPresetFromQueue();

    // Удаляем лазеры, вышедшие за экран
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

    // Ограничиваем движение игрока по вертикали
    if (this.player.y < this.MIN_Y) {
      this.player.setPosition(this.player.x, this.MIN_Y);
      this.player.setVelocityY(0);
    } else if (this.player.y > this.MAX_Y) {
      this.player.setPosition(this.player.x, this.MAX_Y);
      this.player.setVelocityY(0);
    }

    // Обновляем счёт
    const currentScore = Math.max(this.score, Math.floor(this.player.x - 100));
    if (currentScore !== this.score) {
      this.score = currentScore;
      this.scoreText.setText("Score: " + this.score);
    }

    // Удаляем коины, вышедшие за экран
    this.coins = this.coins.filter((coin) => {
      if (coin && coin?.x < this.cameras.main.scrollX - 100) {
        this.coinPool.release(coin);
        return false;
      }
      return true;
    });
  }

  /**
   * Метод прокрутки текущего набора фонов.
   * Фоны будут перемещаться вправо, заменяя друг друга циклично.
   */
  scrollBackgrounds() {
    let bg1: Phaser.GameObjects.Image;
    let bg2: Phaser.GameObjects.Image;

    if (this.currentBackgroundSet === 1) {
      bg1 = this.background1;
      bg2 = this.background2;
    } else if (this.currentBackgroundSet === 2) {
      bg1 = this.background3;
      bg2 = this.background4;
    } else {
      // Добавьте дополнительные наборы фонов, если необходимо
      return;
    }

    const scrollSpeed = 1; // Скорость прокрутки. Настройте по необходимости.

    // Перемещаем фоны влево
    bg1.x -= scrollSpeed;
    bg2.x -= scrollSpeed;

    // Используем displayWidth для корректного расчета
    const bg1DisplayWidth = bg1.displayWidth;
    const bg2DisplayWidth = bg2.displayWidth;

    // Если первый фон полностью вышел за левый край экрана, перемещаем его за второй фон
    if (bg1.x + bg1DisplayWidth <= 0) {
      bg1.x = bg2.x + bg2DisplayWidth;
    }

    // Если второй фон полностью вышел за левый край экрана, перемещаем его за первым фоном
    if (bg2.x + bg2DisplayWidth <= 0) {
      bg2.x = bg1.x + bg1DisplayWidth;
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
