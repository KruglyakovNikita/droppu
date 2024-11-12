"use client";

import Phaser from "phaser";
import { Preset } from "./presets/types";
import { getPresetPool, getRandomDifficulty } from "./utils";

// Константы игры
export const PLAYER_SPEED = 2; // Постоянная скорость вправо
export const MAX_ASCENT_SPEED = -5; // Максимальная скорость подъёма
export const MIN_Y = 10; // Минимальная Y-координата (верхняя граница)
export const MAX_Y = 390; // Максимальная Y-координата (нижняя граница)

export const ASCENT_FORCE = -0.15; // Увеличенная сила подъема для более резкого подъема
export const DESCENT_ACCELERATION = 0.15; // Увеличенное ускорение вниз
export const MAX_DESCENT_SPEED = 6.5; // Максимальная скорость падения
export const MAX_ASCENTT_SPEED = -6.5; // Максимальная скорость взлёта

export const MIN_DISTANCE_BETWEEN_PRESETS = 175; // Минимальное расстояние между пресетами

class GameScene extends Phaser.Scene {
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

  constructor() {
    super({ key: "GameScene" });
  }

  preload() {
    this.load.image("laser", "/blocks/laser.png");
    this.load.image("player", "/player/player.png");
    this.load.image("background", "/map/background2.jpg");
    this.load.image("background2", "/map/background2.jpg");
  }

  create() {
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

    // Инициализация очереди пресетов
    for (let i = 0; i < 3; i++) {
      this.enqueuePreset();
    }

    // Добавление начальных пресетов
    for (let i = 0; i < 3; i++) {
      this.addPresetFromQueue();
    }

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
  }

  update() {
    if (this.isStoped) return;
    this.background1.x -= 1;
    this.background2.x -= 1;

    // Когда первое изображение полностью уходит за левую границу экрана, перемещаем его вправо
    if (this.background1.x <= -this.background1.width) {
      this.background1.x = this.background2.x + this.background2.width;
    }
    // Аналогично для второго изображения
    if (this.background2.x <= -this.background2.width) {
      this.background2.x = this.background1.x + this.background1.width;
    }
    // Устанавливаем постоянную скорость вправо
    this.player.setVelocityX(PLAYER_SPEED);

    // Управление джетпаком
    if (this.cursors.up.isDown || this.cursors.space.isDown) {
      // this.player.applyForce(new Phaser.Math.Vector2(0, ASCENT_FORCE));
      const newVelocityY = Math.max(
        (this.player.body?.velocity.y ?? 0) + ASCENT_FORCE,
        MAX_ASCENTT_SPEED
      );
      this.player.setVelocityY(newVelocityY);
    } else {
      const newVelocityY = Math.min(
        (this.player.body?.velocity.y ?? 0) + DESCENT_ACCELERATION,
        MAX_DESCENT_SPEED
      );
      this.player.setVelocityY(newVelocityY);
    }

    this.addPresetFromQueue();
    // Удаление лазеров за пределами экрана
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

    // Ограничение движения игрока по вертикали
    if (this.player.y < MIN_Y) {
      this.player.setPosition(this.player.x, MIN_Y);
      this.player.setVelocityY(0);
    } else if (this.player.y > MAX_Y) {
      this.player.setPosition(this.player.x, MAX_Y);
      this.player.setVelocityY(0);
    }

    // Обновление счета
    const currentScore = Math.max(this.score, Math.floor(this.player.x - 100));
    if (currentScore !== this.score) {
      this.score = currentScore;
      this.scoreText.setText("Score: " + this.score);
    }
  }

  enqueuePreset() {
    const distance = this.player?.x ?? 0;
    const difficulty = getRandomDifficulty(distance);
    const presetPool = getPresetPool(difficulty);
    let preset: Preset | null = null;

    // Попытка найти подходящий пресет
    for (let i = 0; i < 10; i++) {
      const candidate = Phaser.Utils.Array.GetRandom(presetPool);
      if (candidate) {
        preset = candidate;
        break;
      }
    }

    // Если не найден подходящий пресет, используем более легкие
    if (!preset) {
      const easierPresetPool = getPresetPool("easy");
      preset = Phaser.Utils.Array.GetRandom(easierPresetPool);
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

      // laser.setDisplaySize(length, 10); // Настройте длину и толщину для видимости
      laser.setSensor(true); // Лазеры как сенсоры (не вызывают физическое столкновение)

      this.lasers.push(laser);
      maxOffsetX = Math.max(maxOffsetX, laserConfig.x);
    });

    // Обновляем позицию последнего пресета
    this.lastPlatformX += maxOffsetX + MIN_DISTANCE_BETWEEN_PRESETS;
  }

  handleCollision(event: Phaser.Physics.Matter.Events.CollisionStartEvent) {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair;

      const gameObjectA = bodyA?.gameObject;
      const gameObjectB = bodyB?.gameObject;

      // Проверяем, что объекты существуют перед доступом к ним
      if (!gameObjectA || !gameObjectB) {
        return;
      }

      // Проверяем, что происходит столкновение между игроком и лазером
      if (
        (gameObjectA === this.player &&
          this.lasers.includes(gameObjectB as Phaser.Physics.Matter.Image)) ||
        (gameObjectB === this.player &&
          this.lasers.includes(gameObjectA as Phaser.Physics.Matter.Image))
      ) {
        this.playerTouchLaser();
      }
    });
  }

  playerTouchLaser() {
    // Приостанавливаем мир и окрашиваем игрока в красный цвет при столкновении
    // Приостанавливаем мир и окрашиваем игрока в красный цвет при столкновении
    this.matter.world.pause();
    this.player.setTint(0xff0000);

    // Получаем центр текущего положения камеры
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
      .setInteractive({ useHandCursor: true }); // Устанавливаем курсор "рука"

    const continueText = this.add
      .text(centerX - 60, centerY + 30, "Продолжить", {
        fontSize: "20px",
        color: "#ffffff",
      })
      .setInteractive({ useHandCursor: true }); // Устанавливаем курсор "рука"
    restartText.on("pointerdown", () => {
      this.isStoped = false;
      // Удаляем все элементы модального окна
      modal.destroy();
      restartText.destroy();
      continueText.destroy();

      // Убедимся, что лазеры и другие ресурсы очищаются
      this.lasers.forEach((laser) => laser.destroy());
      this.lasers = [];

      // Перезапуск сцены
      this.scene.restart();
    });

    continueText.on("pointerdown", () => {
      this.isStoped = false;
      modal.destroy();
      restartText.destroy();
      continueText.destroy();
      this.continueGame(); // Продолжение игры
    });
    this.isStoped = true;
  }

  continueGame() {
    // Убираем красный цвет игрока и возобновляем мир
    this.player.clearTint();
    this.matter.world.resume();

    // // Удаляем все лазеры позади игрока на расстоянии 800 пикселей
    // this.lasers.filter((laser) => {
    //   if (laser.x < this.player.x - 800) {
    //     laser.destroy();
    //     return false;
    //   }
    //   return true;
    // });

    // Очищаем массив от уничтоженных лазеров
    console.log(this.lasers[0]?.x);

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
