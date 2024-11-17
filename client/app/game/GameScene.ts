"use client";

import Phaser from "phaser";
import { Preset } from "./presets/types";
import { getPresetPool, getRandomDifficulty } from "./utils";
import { DynamicRocket } from "./weapons/Rocket/DynamicRocket";
import { HomingRocket } from "./weapons/Rocket/HomingRocket";
import { StaticRocket } from "./weapons/Rocket/StaticRocket";
import { WeaponManager } from "./weapons/WeaponManager";
import { LaserCannon } from "./weapons/Laser/LaserCannon"; // Add this import
import { Rocket } from "./weapons/Rocket/Rocket";

// Константы игры
export const PLAYER_SPEED = 2; // Постоянная скорость вправо
export const MAX_ASCENT_SPEED = -5; // Максимальная скорость подъёма
export const MIN_Y = 25; // Минимальная Y-координата (верхняя граница)
export const MAX_Y = 375; // Максимальная Y-координата (нижняя граница)

export const ASCENT_FORCE = -0.15; // Увеличенная сила подъема для более резкого подъема
export const DESCENT_ACCELERATION = 0.15; // Увеличенное ускорение вниз
export const MAX_DESCENT_SPEED = 6.5; // Максимальная скорость падения
export const MAX_ASCENTT_SPEED = -6.5; // Максимальная скорость взлёта

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

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    // Existing preload assets...
    this.load.image("laser", "/blocks/laser.png");
    this.load.image("player", "/player/player.png");
    this.load.image("background", "/map/background2.jpg");
    this.load.image("background2", "/map/background2.jpg");

    // Textures for rockets
    this.load.image("homingRocketTexture", "/blocks/rocket_default_homing.png");
    this.load.image("staticRocketTexture", "/blocks/rocket_default.png");
    this.load.image(
      "dynamicRocketTexture",
      "/blocks/rocket_default_dynamic.png"
    );

    // Texture for smoke
    this.load.image("smoke", "/blocks/smoke.png"); // Ensure the path is correct

    // Sounds
    this.load.audio("rocketLaunch", "/audio/rocket_start.mp3");
    this.load.audio("playerHit", "/audio/rocket_touch.mp3");

    // Warning triangle (if required)
    this.load.image("warningTriangle", "/blocks/warningTriangle.png");

    // Assets for Laser Cannon
    this.load.audio("laserCannonWarning", "/audio/laser_cannon_start.mp3");
    this.load.audio("laserCannonActivate", "/audio/laser_cannon_touch.mp3");
    this.load.audio("laserCannonDeactivate", "/audio/laser_cannon_start.mp3");
  }

  create() {
    this.objectManager = new WeaponManager(this);

    // Создаем игрока с физикой Matter
    this.player = this.matter.add.sprite(100, 200, "player");
    this.player.setFixedRotation(); // Предотвращаем вращение
    this.player.setIgnoreGravity(true); // Отключаем гравитацию для управляемого полета
    this.player.setFrictionAir(0); // Полное отсутствие сопротивления воздуха
    this.player.setFriction(0); // Полное отсутствие трения
    this.player.setMass(10); // Устанавливаем массу для устойчивости

    // Настройка управления
    this.cursors = this.input.keyboard!.createCursorKeys();

    // Настройка счета
    this.score = 0;
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "24px",
      color: "#ffffff",
    });
    this.scoreText.setScrollFactor(0);

    // Настройка камеры
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, Number.MAX_SAFE_INTEGER, 400);

    // Установка начальной постоянной скорости вправо
    this.player.setVelocityX(PLAYER_SPEED);

    // Обработка столкновений
    this.matter.world.on("collisionstart", this.handleCollision, this);

    const { width, height } = this.scale;

    // Создаем два изображения для плавной бесконечной прокрутки
    this.background1 = this.add.image(0, 0, "background");
    this.background2 = this.add.image(this.background1.width, 0, "background2");

    // Масштабируем изображения до высоты экрана
    this.background1.setDisplaySize(width, height);
    this.background2.setDisplaySize(width, height);

    // Устанавливаем оба изображения в верхний левый угол и закрепляем на заднем плане
    this.background1.setOrigin(0, 0).setScrollFactor(0).setDepth(-Infinity);
    this.background2.setOrigin(0, 0).setScrollFactor(0).setDepth(-Infinity);

    // СОЗДАНИЕ ПРЕПЯТСТВИЙ
    // Запускаем генерацию ракет каждые 5 секунд
    // this.generateRocketsByTimer();
    // Start generating Laser Cannons every 15 seconds (adjust as needed)
    this.generateLaserCannonsByTimer();

    // // Инициализация очереди пресетов
    // for (let i = 0; i < 3; i++) {
    //   this.enqueuePreset();
    // }

    // // Добавление начальных пресетов
    // for (let i = 0; i < 3; i++) {
    //   this.addPresetFromQueue();
    // }

    this.events.on("playerHit", this.handlePlayerHit, this);
  }

  generateLaserCannonsByTimer() {
    this.generateLaserCannonTimer = this.time.addEvent({
      delay: 8000, // Every 8 seconds (adjust as needed)
      callback: this.generateLaserCannon,
      callbackScope: this,
      loop: true,
    });
  }

  generateLaserCannon() {
    const laserCannon = new LaserCannon(this);
    this.objectManager.addObject("laserCannon", laserCannon, {});
  }

  generateRocketsByTimer() {
    this.generateRockettimer = this.time.addEvent({
      delay: 5000, // 5 секунд
      callback: this.generateRocket,
      callbackScope: this,
      loop: true,
    });
  }

  /**
   * Метод обновления сцены
   * @param time Текущее время
   * @param delta Время с последнего кадра в миллисекундах
   */
  update(delta: number) {
    if (this.isStoped) {
      this.time.removeAllEvents();
      return;
    }

    // Update all weapon objects, passing the player and delta
    if (this.objectManager) {
      this.objectManager.update(this.player, delta);
    }

    // Update the background for infinite scrolling
    this.background1.x -= 1;
    this.background2.x -= 1;

    // Move backgrounds to create infinite scrolling effect
    if (this.background1.x <= -this.background1.width) {
      this.background1.x = this.background2.x + this.background2.width;
    }
    if (this.background2.x <= -this.background2.width) {
      this.background2.x = this.background1.x + this.background1.width;
    }

    // Set constant speed to the right
    this.player.setVelocityX(PLAYER_SPEED);

    // Jetpack control: handle keyboard (up arrow, space) and screen tap
    if (
      this.cursors.up.isDown || // Up arrow key
      this.cursors.space.isDown || // Space key
      this.input.activePointer.isDown // Screen tap
    ) {
      const newVelocityY = Math.max(
        (this.player.body?.velocity.y ?? 0) + ASCENT_FORCE,
        MAX_ASCENT_SPEED
      );
      this.player.setVelocityY(newVelocityY);
    } else {
      const newVelocityY = Math.min(
        (this.player.body?.velocity.y ?? 0) + DESCENT_ACCELERATION,
        MAX_DESCENT_SPEED
      );
      this.player.setVelocityY(newVelocityY);
    }

    // Add presets from the queue
    this.addPresetFromQueue();

    // Remove static lasers that are out of the screen
    this.lasers = this.lasers.filter((laser) => {
      if (
        laser &&
        this.cameras?.main?.scrollX !== undefined &&
        laser.x < this.cameras.main.scrollX - 100
      ) {
        laser.destroy();
        return false;
      }
      return true;
    });

    // Clamp player movement vertically
    if (this.player.y < MIN_Y) {
      this.player.setPosition(this.player.x, MIN_Y);
      this.player.setVelocityY(0);
    } else if (this.player.y > MAX_Y) {
      this.player.setPosition(this.player.x, MAX_Y);
      this.player.setVelocityY(0);
    }

    // Update score
    const currentScore = Math.max(this.score, Math.floor(this.player.x - 100));
    if (currentScore !== this.score) {
      this.score = currentScore;
      this.scoreText.setText("Score: " + this.score);
    }
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
      const harderPresetPool = getPresetPool("hard"); // Исправлено с "easier" на "hard" для логики
      preset = Phaser.Utils.Array.GetRandom(harderPresetPool);
    }

    // Если всё ещё не найдено, используем любой пресет из исходного пула
    if (!preset) {
      preset = Phaser.Utils.Array.GetRandom(presetPool);
    }

    // Добавляем пресет в очередь
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
      this.enqueuePreset(); // Добавляем новый пресет в очередь
    }
  }

  /**
   * Метод создания пресета лазеров
   * @param preset Пресет для создания лазеров
   */
  createPreset(preset: Preset) {
    // Генерируем лазеры из пресета
    let maxOffsetX = 0;
    preset.lasers.forEach((laserConfig) => {
      const x = this.lastPlatformX + laserConfig.x;
      const y = laserConfig.y;
      const angle = Phaser.Math.DegToRad(laserConfig.angle || 0);
      const laserLength = 80;

      // Создаем лазер как Matter.Image и настраиваем его
      const laser = this.matter.add.image(x, y, "laser", undefined, {
        isStatic: true,
      });

      laser.setOrigin(0.5, 0.5);
      laser.setRotation(angle);
      laser.setDisplaySize(25, laserLength); // Настройте длину и толщину для видимости

      laser.setSensor(true); // Лазеры как сенсоры (не вызывают физическое столкновение)

      this.lasers.push(laser);
      maxOffsetX = Math.max(maxOffsetX, laserConfig.x);
    });

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

      // Проверяем, что объекты существуют перед доступом к ним
      if (!gameObjectA || !gameObjectB) {
        return;
      }

      // Проверяем столкновение между игроком и лазером
      if (
        (gameObjectA === this.player &&
          gameObjectB instanceof Phaser.Physics.Matter.Image &&
          this.lasers.includes(gameObjectB)) ||
        (gameObjectB === this.player &&
          gameObjectA instanceof Phaser.Physics.Matter.Image &&
          this.lasers.includes(gameObjectA))
      ) {
        this.handlePlayerHit();
      }

      // Проверяем столкновение между игроком и ракетой
      if (
        (gameObjectA === this.player &&
          gameObjectB instanceof Rocket &&
          gameObjectB.active) ||
        (gameObjectB === this.player &&
          gameObjectA instanceof Rocket &&
          gameObjectA.active)
      ) {
        this.handlePlayerHit();
      }

      // Проверяем столкновение между игроком и лазерной пушкой (если нужно)
      // Здесь мы подразумеваем, что лазерная пушка имеет физическое тело
      const laserCannons = this.objectManager.getObjectsByType("laserCannon");
      laserCannons.forEach((cannonObj) => {
        const cannon = cannonObj.instance as LaserCannon;

        // Добавляем проверку на физическое тело у LaserCannon, если требуется
        if (
          (gameObjectA === this.player &&
            gameObjectB instanceof LaserCannon &&
            gameObjectB === cannon) ||
          (gameObjectB === this.player &&
            gameObjectA instanceof LaserCannon &&
            gameObjectA === cannon)
        ) {
          this.handlePlayerHit();
        }
      });
    });
  }

  handlePlayerHit() {
    if (this.isStoped) return; // Prevent multiple triggers

    this.isStoped = true;

    // Pause the game world
    this.matter.world.pause();
    this.player.setTint(0xff0000);

    // Remove all active warning triangles from weapons
    this.objectManager.objects.forEach((obj) => {
      if (typeof obj.instance.destroyWarning === "function") {
        obj.instance.destroyWarning();
      }
    });

    // Get the center of the current camera view
    const centerX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const centerY =
      this.cameras.main.worldView.y + this.cameras.main.height / 2;

    // Display modal window
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

    restartText.on("pointerdown", () => {
      this.isStoped = false;
      // Remove all modal elements
      modal.destroy();
      restartText.destroy();
      continueText.destroy();

      // Clean up weapons and other resources
      this.objectManager.objects.forEach((obj) =>
        this.objectManager.removeObject(obj.instance)
      );

      // Restart the scene
      this.scene.restart();
    });

    continueText.on("pointerdown", () => {
      this.isStoped = false;
      this.generateRocketsByTimer();
      this.generateLaserCannonsByTimer();

      // Remove modal elements
      modal.destroy();
      restartText.destroy();
      continueText.destroy();

      // Continue the game
      this.continueGame();
    });
  }

  /**
   * Метод продолжения игры после столкновения
   */
  continueGame() {
    // Убираем красный цвет игрока и возобновляем мир
    this.player.clearTint();
    this.matter.world.resume();

    this.lasers = this.lasers.filter((laser) => {
      if (laser.x < this.lastPlatformX) {
        laser.destroy();
        return false;
      }
      return true;
    });

    // Обновляем генерацию пресетов, начиная с текущей позиции игрока
    this.lastPlatformX = this.player.x + 500; // Устанавливаем для новой генерации пресетов
  }
}

export default GameScene;
