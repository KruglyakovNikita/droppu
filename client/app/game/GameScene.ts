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

// Константы игры
export const PLAYER_SPEED = 2; // Постоянная скорость вправо

export const MIN_DISTANCE_BETWEEN_PRESETS = 175; // Минимальное расстояние между пресетами

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
  lastPlatformX: number = 300;
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
  gameId!: string;
  booster!: number;
  userSkinUrl!: string;
  userSpriteUrl!: string;
  onGameEnd!: (scroe: any, coins: any, heails: any, gameId: any) => void;
  onPurchaseAttempt!: (cost: number) => Promise<"ok" | "canceled">;

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

  constructor() {
    super({ key: "GameScene" });
  }

  init() {
    console.log("init");

    const gameData = GameData.instance; // Используем Singleton
    const data = gameData.getData();
    console.log("data", data);

    this.gameId = data.gameId;
    this.booster = data.booster;
    this.userSkinUrl = data.userSkinUrl;
    this.userSpriteUrl = data.userSpriteUrl;
    this.onGameEnd = data.onGameEnd;
    this.onPurchaseAttempt = data.onPurchaseAttempt;

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
      this.player = this.matter.add.sprite(100, 200, "userSprite");
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

    preset.lasers.forEach((laserConfig) => {
      const x = this.lastPlatformX + laserConfig.x * this.scale.width; // x теперь относительный
      const y = laserConfig.y * this.scale.height; // y теперь относительный
      const angle = Phaser.Math.DegToRad(laserConfig.angle || 0);
      const laserLength = 80 * heightScale;

      // Создание лазера
      const laser = this.matter.add.image(x, y, "laser", undefined, {
        isStatic: true,
      });

      // Настройка лазера
      laser.setOrigin(0.5, 0.5);
      laser.setRotation(angle);
      laser.setDisplaySize(25, laserLength);

      laser.setSensor(true);

      this.lasers.push(laser);
      maxOffsetX = Math.max(maxOffsetX, laserConfig.x * this.scale.width);
    });

    if (preset.coins) {
      preset.coins.forEach((coinConfig) => {
        const x = this.lastPlatformX + coinConfig.x * this.scale.width;
        const y = coinConfig.y * this.scale.height;

        // Создание коина
        const coin = this.matter.add.sprite(x, y, "coin");
        coin.setDisplaySize(this.scale.width * 0.03, this.scale.height * 0.05);
        coin.setSensor(true);
        coin.setIgnoreGravity(true);
        coin.setDepth(1);

        // Запуск анимации вращения
        coin.play("spin");

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
    coinObject.destroy();

    // Удаляем коин из массива
    this.coins = this.coins.filter((coin) => coin !== coinObject);

    // Увеличиваем счетчик коинов
    this.coinCount += 1;
    this.coinText.setText("Coins: " + this.coinCount);
  }

  destroyCoin() {
    this.coins.forEach((coin) => coin.destroy());
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
    this.matter.world.pause();
    this.player.setTint(0xff0000);

    // Убираем предупреждения
    this.objectManager.objects.forEach((obj) => {
      if (typeof obj.instance.destroyWarning === "function") {
        obj.instance.destroyWarning();
      }
    });

    // Получаем центр экрана
    const centerX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const centerY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;

    // Создаем массив для хранения элементов модалки
    const modalElements: Phaser.GameObjects.GameObject[] = [];

    // Отображаем затемненный фон
    const overlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.75
    );
    modalElements.push(overlay);

    // // Создаем модальное окно с обводкой
    // const modalWidth = 500;
    // const modalHeight = 350;
    // const modal = this.add.rectangle(
    //   centerX,
    //   centerY,
    //   undefined,
    //   undefined,
    //   0x0b0b0b, // Темно-серый цвет
    //   0.75 // Устанавливаем прозрачность (0.9 - почти непрозрачно)
    // );
    // modal.setStrokeStyle(4, 0x0b0b0b, 0.8);
    // modalElements.push(modal);

    // Создаем градиентную текстуру для кнопки "Продолжить"

    // Кнопка "Продолжить"
    const continueButtonX = centerX;
    const continueButtonY = centerY - 50;
    const gradientTexture = this.textures.createCanvas("gradient", 250, 60);

    const continueButton = this.add.image(
      continueButtonX,
      continueButtonY,
      "gradient"
    );
    continueButton.setInteractive({ useHandCursor: true });
    modalElements.push(continueButton);

    const continueButtonWidth = 250;
    const continueButtonHeight = 60;
    if (gradientTexture) {
      const gradientCtx = gradientTexture.getContext();

      const gradient = gradientCtx.createLinearGradient(0, 0, 0, 60);
      gradient.addColorStop(0, "#00008b"); // Темно-синий
      gradient.addColorStop(1, "#1e90ff"); // Светло-синий

      gradientCtx.fillStyle = gradient;
      this.drawRoundedRect(
        gradientCtx,
        0,
        0,
        continueButtonWidth,
        continueButtonHeight,
        12
      ); // Радиус углов — 12px
      gradientTexture.refresh();
    }

    // Пульсирующая обводка для кнопки "Продолжить"
    const continueButtonBorder = this.add.graphics();
    continueButtonBorder.lineStyle(4, 0xff0000, 1);
    continueButtonBorder.strokeRoundedRect(
      continueButtonX - continueButtonWidth / 2,
      continueButtonY - continueButtonHeight / 2,
      continueButtonWidth,
      continueButtonHeight,
      12
    );
    modalElements.push(continueButtonBorder);

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
        continueButtonX - 20,
        continueButtonY,
        `Продолжить x${this.continueCount + 1}`,
        {
          fontSize: "24px",
          color: "#ffffff",
          fontStyle: "bold",
        }
      )
      .setOrigin(0.5);
    modalElements.push(continueButtonText);

    // Иконка хилки (меньшего размера и справа от текста)
    const healIcon = this.add
      .image(continueButtonX + 90, continueButtonY, "healIcon")
      .setDisplaySize(30, 30); // Уменьшение размера иконки
    modalElements.push(healIcon);

    // Таймер сбоку кнопки "Продолжить"
    const timerCircleRadius = 15; // Уменьшенный радиус
    const timerCircleX = continueButtonX + continueButtonWidth / 2 - 5;
    const timerCircleY = continueButtonY - continueButtonHeight / 2;

    const timerCircle = this.add.circle(
      timerCircleX,
      timerCircleY,
      timerCircleRadius,
      0xff0000
    );
    modalElements.push(timerCircle);

    const timerText = this.add
      .text(timerCircleX, timerCircleY, `${this.purchaseTimeLeft}`, {
        fontSize: "16px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    modalElements.push(timerText);

    // Таймер пульсации для круга таймера
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
      args: [timerText, continueButton, timerCircle, modalElements],
      callbackScope: this,
      loop: true,
    });

    // === Кнопка "Закончить игру" ===

    const finishButtonWidth = 200;
    const finishButtonHeight = 50;
    const finishButtonX = centerX;
    const finishButtonY = centerY + 50; // Располагаем ниже кнопки "Продолжить"

    const finishButton = this.add.rectangle(
      finishButtonX,
      finishButtonY,
      finishButtonWidth,
      finishButtonHeight,
      0x808080 // Серый цвет для менее привлекательной кнопки
    );
    finishButton.setInteractive({ useHandCursor: true });
    modalElements.push(finishButton);

    // Обводка для кнопки "Закончить игру"
    const finishButtonBorder = this.add.graphics();
    finishButtonBorder.lineStyle(2, 0x333333, 1);
    finishButtonBorder.strokeRect(
      finishButtonX - finishButtonWidth / 2,
      finishButtonY - finishButtonHeight / 2,
      finishButtonWidth,
      finishButtonHeight
    );
    modalElements.push(finishButtonBorder);

    // Текст на кнопке "Закончить игру"
    const finishButtonText = this.add
      .text(finishButtonX, finishButtonY, "Закончить игру", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    modalElements.push(finishButtonText);

    // Обработчик нажатия на кнопку "Закончить игру"
    finishButton.on("pointerdown", () => {
      this.closeModal(modalElements);
      this.onGameEnd(
        this.score,
        this.coinCount,
        this.continueCount,
        this.gameId
      );
      this.isStoped = true;
    });

    this.clearGame();
    // Обработчик нажатия на кнопку "Продолжить"
    continueButton.on("pointerdown", async () => {
      console.log("Purchase button clicked.");
      this.isPurchasing = true;

      // Останавливаем таймер
      if (this.purchaseTimer) {
        this.purchaseTimer.paused = true;
      }

      // Вызываем внешнюю функцию покупки
      const continueCost = Math.pow(2, this.continueCount); // Стоимость удваивается каждый раз
      const purchaseResult = await this.onPurchaseAttempt(continueCost);

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
  }

  createPurchaseTimer(timerText, continueButton, timerCircle, modalElements) {
    if (!timerText || !continueButton || !timerCircle || !modalElements) {
      console.error("Ошибка: Один из параметров не определён!");
      return;
    }
    console.log("Таймер запущен:", this.purchaseTimeLeft);
    console.log("Таймер вызван, осталось времени:", this.purchaseTimeLeft);

    if (!this.isPurchasing) {
      this.purchaseTimeLeft -= 1;

      // Обновляем текст таймера
      if (this.purchaseTimeLeft > 0) {
        console.log("purchaseTimeLeft:", this.purchaseTimeLeft);
        timerText.setText(`${this.purchaseTimeLeft}`);
      } else {
        console.log("Время вышло");

        // Время вышло
        this.purchaseTimer?.remove(false);
        this.purchaseTimer = null;

        // Блокируем кнопку покупки
        continueButton.disableInteractive();
        timerText.setText("✖");
        timerCircle.setFillStyle(0x888888, 1);

        // Таймер закрытия модалки через 30 секунд
        this.modalTimeout = this.time.delayedCall(
          30000,
          () => {
            this.closeModal(modalElements);
            this.onGameEnd(
              this.score,
              this.coinCount,
              this.continueCount,
              this.gameId
            );
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
    // Убираем красный цвет и возобновляем мир

    // Очистка старых объектов и таймеров
    this.lasers.forEach((laser) => laser.destroy());
    this.lasers = [];
    this.destroyCoin();
    this.objectManager.removeAllObjects();
  }

  continueGame() {
    this.player.clearTint();
    this.matter.world.resume();
    // Перезапуск таймеров генерации препятствий
    //////TEST
    // this.generateRocketsByTimer();
    // this.generateLaserCannonsByTimer();
  }
  /**
   * Метод обновления сцены
   */
  update() {
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
        laser.destroy();
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
        coin.destroy();
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
