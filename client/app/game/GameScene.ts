"use client";

import Phaser from "phaser";
import { Preset } from "./presets/types";
import { getPresetPool, getRandomDifficulty } from "./utils";
import { DynamicRocket } from "./weapons/Rocket/DynamicRocket";
import { HomingRocket } from "./weapons/Rocket/HomingRocket";
import { StaticRocket } from "./weapons/Rocket/StaticRocket";
import { WeaponManager } from "./weapons/WeaponManager";
import { LaserCannon } from "./weapons/Laser/LaserCannon";
import { Rocket } from "./weapons/Rocket/Rocket";
import { GameSceneData } from "./Game";
import GameData from "./GameData";

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
  onGameEnd!: () => void;

  // Адаптивные константы
  MIN_Y!: number;
  MAX_Y!: number;
  ASCENT_FORCE!: number;
  DESCENT_ACCELERATION!: number;
  MAX_DESCENT_SPEED!: number;
  MAX_ASCENT_SPEED!: number;

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

    // Загрузка других ресурсов
    this.load.image("laser", "/blocks/laser.png");
    this.load.image("background", "/map/background.webp");
    this.load.image("background2", "/map/background.webp");

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
    this.background1 = this.add.image(0, 0, "background");
    this.background2 = this.add.image(this.background1.width, 0, "background2");

    // Масштабируем изображения до размеров экрана
    this.background1.setDisplaySize(this.scale.width, this.scale.height);
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

    // Инициализация очереди пресетов
    for (let i = 0; i < 3; i++) {
      this.enqueuePreset();
    }

    // Добавление начальных пресетов
    for (let i = 0; i < 3; i++) {
      this.addPresetFromQueue();
    }
    // СОЗДАНИЕ ПРЕПЯТСТВИЙ
    // Запускаем генерацию ракет каждые 8 секунд
    this.generateRocketsByTimer();
    // Запускаем генерацию лазерных пушек каждые 8 секунд (можно изменить по необходимости)
    this.generateLaserCannonsByTimer();

    this.events.on("playerHit", this.handlePlayerHit, this);
  }

  generateLaserCannonsByTimer() {
    this.generateLaserCannonTimer = this.time.addEvent({
      delay: 8000, // Каждые 8 секунд
      callback: this.generateLaserCannon,
      callbackScope: this,
      loop: true,
    });
  }

  generateLaserCannon() {
    const laserCannonTypes = ["static", "homing", "dynamic"];
    // const type = Phaser.Utils.Array.GetRandom(laserCannonTypes);
    const type = "dynamic"; // Для тестирования всегда создаём 'dynamic'

    const laserCannon = new LaserCannon(this, type, this.player);
    this.objectManager.addObject("laserCannon", laserCannon, { type });
  }

  generateRocketsByTimer() {
    this.generateRockettimer = this.time.addEvent({
      delay: 12000, // 8 секунд
      callback: this.generateRocket,
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * Метод генерации ракеты
   */
  generateRocket() {
    const rocketTypes = ["homing", "static", "dynamic"];
    const rocketType = Phaser.Utils.Array.GetRandom(rocketTypes);

    let rocket;
    const initialX = this.cameras.main.scrollX + this.cameras.main.width + 100; // X-координата ракеты справа от экрана
    const yPosition = this.player.y; // Для homing и dynamic rockets

    switch (rocketType) {
      case "homing":
        rocket = new HomingRocket(this, initialX, yPosition, this.player, 5);
        rocket.setWarning(
          () => this.cameras.main.scrollX + this.cameras.main.width - 20,
          () => this.player.y // Динамическое отслеживание Y игрока
        );
        break;
      case "static":
        const fixedY = Phaser.Math.Between(50, 350);
        rocket = new StaticRocket(this, initialX, fixedY, 3);
        rocket.setWarning(
          () => this.cameras.main.scrollX + this.cameras.main.width - 20,
          () => fixedY // Фиксированное Y
        );
        break;
      case "dynamic":
        rocket = new DynamicRocket(
          this,
          initialX,
          yPosition,
          this.player,
          4,
          20
        ); // Амплитуда 20 пикселей
        rocket.setWarning(
          () => this.cameras.main.scrollX + this.cameras.main.width - 20,
          () => this.player.y // Динамическое отслеживание Y игрока
        );
        break;
      default:
        console.warn(`Unknown rocket type: ${rocketType}`);
        return;
    }

    if (rocket) {
      this.objectManager.addObject("rocket", rocket, {
        type: rocketType,
        x: rocket.x,
        y: rocket.y,
      });
    }
  }

  /**
   * Метод добавления пресета в очередь
   */
  enqueuePreset() {
    const distance = this.player?.x ?? 0;
    const difficulty = getRandomDifficulty(distance);
    const presetPool = getPresetPool(difficulty);
    let preset: Preset | null = null;

    for (let i = 0; i < presetPool.length; i++) {
      if (this.testInd === i) {
        preset = presetPool[i];
        this.testInd = i + 1;
      }
    }
    if (!preset) {
      const harderPresetPool = getPresetPool("hard");
      preset = Phaser.Utils.Array.GetRandom(harderPresetPool);
    }

    if (!preset) {
      preset = Phaser.Utils.Array.GetRandom(presetPool);
    }

    if (preset) {
      this.presetQueue.push(preset);
    } else {
      console.error("No presets available to enqueue.");
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

    // Отображаем модальное окно
    const modal = this.add.rectangle(centerX, centerY, 300, 200, 0x000000, 0.8);
    const restartText = this.add
      .text(centerX - 70, centerY - 30, "Начать заново", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true });

    const continueText = this.add
      .text(centerX - 60, centerY + 30, "Продолжить", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true });

    // Добавляем обработчики событий
    restartText.on("pointerdown", () => {
      console.log("Restart button clicked.");
      this.isStoped = false;
      modal.destroy();
      restartText.destroy();
      continueText.destroy();

      this.coinCount = 0;
      this.lasers.forEach((laser) => laser.destroy());
      this.lasers = [];
      this.destroyCoin();

      // Очищаем объекты
      this.objectManager.removeAllObjects();

      // Перезапускаем сцену
      this.scene.restart();

      // Вызываем onGameEnd
      this.onGameEnd();
    });

    continueText.on("pointerdown", () => {
      console.log("Continue button clicked.");
      this.objectManager.removeAllObjects();
      this.isStoped = false;

      // Убираем модальные элементы
      modal.destroy();
      restartText.destroy();
      continueText.destroy();

      // Продолжаем игру
      this.destroyCoin();

      this.continueGame();
    });
  }

  destroyCoin() {
    this.coins.forEach((coin) => coin.destroy());
    this.coins = [];
  }

  /**
   * Метод продолжения игры после столкновения
   */
  continueGame() {
    // Убираем красный цвет и возобновляем мир
    this.player.clearTint();
    this.matter.world.resume();

    this.lasers = this.lasers.filter((laser) => {
      if (laser?.x < this.lastPlatformX) {
        laser.destroy();
        return false;
      }
      return true;
    });
    this.destroyCoin();

    // Обновляем позицию для новых пресетов
    this.lastPlatformX = this.player.x + 300;
  }

  /**
   * Метод обновления сцены
   */
  update() {
    if (this.isStoped) {
      this.time.removeAllEvents();
      return;
    }

    // Обновляем все объекты
    if (this.objectManager) {
      this.objectManager.update(this.player);
    }

    // Обновляем фон для бесконечной прокрутки
    this.background1.x -= 1;
    this.background2.x -= 1;

    // Перемещаем фон для эффекта бесконечной прокрутки
    if (this.background1.x <= -this.background1.width) {
      this.background1.x = this.background2.x + this.background2.width;
    }
    if (this.background2.x <= -this.background2.width) {
      this.background2.x = this.background1.x + this.background1.width;
    }

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

    // Обновляем счет
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
}

export default GameScene;
