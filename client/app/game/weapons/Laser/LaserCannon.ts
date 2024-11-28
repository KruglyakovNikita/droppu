import Phaser from "phaser";

// Константы для временных интервалов и настроек
const WARNING_DURATION = 3000;
const GUN_APPEAR_DURATION = 500;
const LASER_DURATION = 2000;
const GUN_DISAPPEAR_DURATION = 500;
const CAMER_GAP = 25;

// Константы для осцилляций динамических пушек
const DYNAMIC_OSCILLATION_AMPLITUDE = 15;
const DYNAMIC_OSCILLATION_FREQUENCY = 2;
const DYNAMIC_OSCILLATION_DURATION = 3000;

export class LaserCannon {
  scene: Phaser.Scene;
  player: Phaser.Physics.Matter.Sprite;
  laserPlasma: Phaser.Physics.Matter.Image[] = [];
  leftGun: Phaser.GameObjects.Image;
  rightGun: Phaser.GameObjects.Image;
  warningLeft: Phaser.GameObjects.Image | undefined;
  warningRight: Phaser.GameObjects.Image | undefined;
  active: boolean = false;
  timers: Phaser.Time.TimerEvent[] = [];
  private updateWarningPosition: (() => void) | null = null;
  type: "static" | "homing" | "dynamic";
  initialY: number;

  // Новая переменная для хранения Y-координаты плазмы
  private plasmaY: number | null = null;

  // Переменные для осцилляции
  private oscillating: boolean = false;
  private oscillationStartTime: number = 0;
  private baseY: number = 0;

  // Адаптивные константы
  GUN_MOVE_DISTANCE!: number;
  PLASMA_SCREEN_X!: number;

  constructor(
    scene: Phaser.Scene,
    type: "static" | "homing" | "dynamic",
    player: Phaser.Physics.Matter.Sprite
  ) {
    this.scene = scene;
    this.type = type;
    this.player = player;

    // Устанавливаем адаптивные константы
    this.GUN_MOVE_DISTANCE = this.scene.scale.width * 0.1;
    this.PLASMA_SCREEN_X = this.scene.scale.width * 0.2;

    // Устанавливаем начальную позицию Y
    if (this.type === "static") {
      this.initialY = Phaser.Math.Between(50, this.scene.scale.height - 50);
    } else {
      this.initialY = this.player.y;
    }

    // Создаем лазерные пушки
    this.leftGun = this.scene.add.image(
      -this.GUN_MOVE_DISTANCE,
      this.initialY,
      "laserGun"
    );
    this.rightGun = this.scene.add.image(
      this.scene.cameras.main.width + this.GUN_MOVE_DISTANCE,
      this.initialY,
      "laserGun"
    );
    this.leftGun.setScale(0.5);
    this.rightGun.setScale(0.5);
    this.rightGun.setFlipX(true);
    this.leftGun.setDepth(2);
    this.rightGun.setDepth(2);

    // Привязываем пушки к камере
    this.leftGun.setScrollFactor(0);
    this.rightGun.setScrollFactor(0);

    // Запускаем последовательность
    this.startSequence();
  }

  startSequence() {
    // Отображаем предупреждающие треугольники
    this.warningLeft = this.scene.add.image(
      CAMER_GAP,
      this.initialY,
      "warningTriangle"
    );
    this.warningRight = this.scene.add.image(
      this.scene.cameras.main.width - CAMER_GAP,
      this.initialY,
      "warningTriangle"
    );
    this.warningLeft.setScale(0.5);
    this.warningRight.setScale(0.5);
    this.warningLeft.setAlpha(0.8);
    this.warningRight.setAlpha(0.8);
    this.warningLeft.setVisible(true);
    this.warningRight.setVisible(true);
    this.warningLeft.setDepth(2);
    this.warningRight.setDepth(2);

    // Фиксируем предупреждения на экране
    this.warningLeft.setScrollFactor(0);
    this.warningRight.setScrollFactor(0);

    // Воспроизводим звук предупреждения
    this.scene.sound.play("laserCannonWarning");

    // Анимация мигания предупреждений
    this.scene.tweens.add({
      targets: [this.warningLeft, this.warningRight],
      alpha: { from: 0.8, to: 0 },
      ease: "Linear",
      duration: 300,
      repeat: -1,
      yoyo: true,
    });

    // Для 'homing' и 'dynamic' устанавливаем разные поведения
    if (this.type === "homing" || this.type === "dynamic") {
      // Пушки следуют за игроком во время фазы предупреждения
      this.updateWarningPosition = () => {
        this.initialY = this.player.y;
        this.warningLeft?.setY(this.initialY);
        this.warningRight?.setY(this.initialY);
      };
      this.scene.events.on("update", this.updateWarningPosition);
    }

    // Через WARNING_DURATION миллисекунд убираем предупреждения
    const warningTimer = this.scene.time.delayedCall(
      WARNING_DURATION,
      () => {
        this.warningLeft?.destroy();
        this.warningRight?.destroy();

        if (this.updateWarningPosition) {
          this.scene.events.off("update", this.updateWarningPosition);
          this.updateWarningPosition = null;
        }

        if (this.type === "homing" || this.type === "dynamic") {
          // Ждем 0.5 секунды перед началом анимации пушек
          const fireDelayTimer = this.scene.time.delayedCall(
            500,
            () => {
              this.activateLaser();
            },
            [],
            this
          );
          this.timers.push(fireDelayTimer);
        } else {
          // Для 'static' активируем лазер сразу
          this.activateLaser();
        }
      },
      [],
      this
    );
    this.timers.push(warningTimer);
  }

  activateLaser() {
    this.active = true;

    // Запоминаем текущее положение Y
    const fixedY = this.initialY;
    this.baseY = fixedY;
    this.plasmaY = fixedY;

    // Анимируем выезд пушек на экран
    const leftGunTargetX = 0;
    const rightGunTargetX = this.scene.cameras.main.width;

    // Смещаем пушки внутрь экрана на заданное расстояние
    const leftGunFinalX = leftGunTargetX + this.GUN_MOVE_DISTANCE;
    const rightGunFinalX = rightGunTargetX - this.GUN_MOVE_DISTANCE;

    // Устанавливаем фиксированное положение Y
    this.leftGun.setY(fixedY);
    this.rightGun.setY(fixedY);

    this.scene.tweens.add({
      targets: this.leftGun,
      x: leftGunFinalX,
      y: fixedY,
      duration: GUN_APPEAR_DURATION,
      ease: "Power1",
      onComplete: () => {
        this.fireLaser(fixedY);
      },
    });

    this.scene.tweens.add({
      targets: this.rightGun,
      x: rightGunFinalX,
      y: fixedY,
      duration: GUN_APPEAR_DURATION,
      ease: "Power1",
    });
  }

  fireLaser(fixedY: number) {
    // Создаем лазерную плазму
    const cameraScrollX = this.scene.cameras.main.scrollX;
    const cameraScrollY = this.scene.cameras.main.scrollY;

    const leftGunX = this.leftGun.x + cameraScrollX;
    const rightGunX = this.rightGun.x + cameraScrollX;

    const plasmaHeight = 20;
    const laserLength = rightGunX - leftGunX - this.leftGun.displayWidth;

    // Создаем один большой сегмент плазмы между пушками
    const x = leftGunX + this.leftGun.displayWidth / 2 + laserLength / 2;
    const y = fixedY + cameraScrollY;

    const segment = this.scene.matter.add.image(x, y, "laserPlazm", undefined, {
      isSensor: true,
      isStatic: true,
    });
    segment.setDisplaySize(laserLength, plasmaHeight);
    segment.setDepth(1);

    this.laserPlasma.push(segment);

    // Воспроизводим звук активации
    this.scene.sound.play("laserCannonActivate");

    // Если тип 'dynamic', запускаем осцилляцию
    if (this.type === "dynamic") {
      this.startOscillation();
    }

    // Через LASER_DURATION миллисекунд скрываем плазму
    const plasmaTimer = this.scene.time.delayedCall(
      LASER_DURATION,
      () => {
        this.laserPlasma.forEach((segment) => segment.destroy());
        this.laserPlasma = [];

        // После этого пушки уходят за экран и удаляются
        this.deactivateLaser();
      },
      [],
      this
    );
    this.timers.push(plasmaTimer);
  }

  startOscillation() {
    this.oscillating = true;
    this.oscillationStartTime = this.scene.time.now;

    // Запускаем таймер для окончания осцилляции
    const oscillationTimer = this.scene.time.delayedCall(
      DYNAMIC_OSCILLATION_DURATION,
      () => {
        this.oscillating = false;
      },
      [],
      this
    );
    this.timers.push(oscillationTimer);
  }

  deactivateLaser() {
    this.active = false;

    // Анимируем уход пушек за экран
    const leftGunExitX = -this.GUN_MOVE_DISTANCE;
    const rightGunExitX =
      this.scene.cameras.main.width + this.GUN_MOVE_DISTANCE;

    this.scene.tweens.add({
      targets: this.leftGun,
      x: leftGunExitX,
      duration: GUN_DISAPPEAR_DURATION,
      ease: "Power1",
    });

    this.scene.tweens.add({
      targets: this.rightGun,
      x: rightGunExitX,
      duration: GUN_DISAPPEAR_DURATION,
      ease: "Power1",
      onComplete: () => {
        this.destroy();
      },
    });
    this.plasmaY = null;

    // Воспроизводим звук деактивации
    this.scene.sound.play("laserCannonDeactivate");
  }

  update(player: Phaser.Physics.Matter.Sprite) {
    // Для 'dynamic' пушки осциллируют только когда активны и осцилляция включена
    if (this.type === "dynamic") {
      if (this.active && this.oscillating) {
        const elapsedTime =
          (this.scene.time.now - this.oscillationStartTime) / 1000;
        const waveOffsetY =
          DYNAMIC_OSCILLATION_AMPLITUDE *
          Math.sin(2 * Math.PI * DYNAMIC_OSCILLATION_FREQUENCY * elapsedTime);
        const oscillatedY = this.baseY + waveOffsetY;
        const clampedY = Phaser.Math.Clamp(
          oscillatedY,
          15,
          this.scene.scale.height - 15
        );

        // Устанавливаем новое положение пушек
        this.leftGun.setY(clampedY);
        this.rightGun.setY(clampedY);

        // Обновляем позицию плазмы
        const cameraScrollX = this.scene.cameras.main.scrollX;
        const cameraScrollY = this.scene.cameras.main.scrollY;

        const newX =
          cameraScrollX +
          this.PLASMA_SCREEN_X +
          (this.scene.cameras.main.width - 2 * this.PLASMA_SCREEN_X) / 2;
        const newYPos = clampedY + cameraScrollY;

        this.laserPlasma.forEach((segment) => {
          segment.setPosition(newX, newYPos);
        });
      }
    }

    // Обновляем позицию плазмы, если она создана и не осциллирует
    if (
      this.plasmaY !== null &&
      !(this.type === "dynamic" && this.oscillating)
    ) {
      const cameraScrollX = this.scene.cameras.main.scrollX;
      const cameraScrollY = this.scene.cameras.main.scrollY;

      const newX =
        cameraScrollX +
        this.PLASMA_SCREEN_X +
        (this.scene.cameras.main.width - 2 * this.PLASMA_SCREEN_X) / 2;
      const newYPos = this.plasmaY + cameraScrollY;

      this.laserPlasma.forEach((segment) => {
        segment.setPosition(newX, newYPos);
      });
    }
  }

  destroy() {
    this.timers.forEach((timer) => timer.remove(false));
    this.timers = [];

    this.laserPlasma.forEach((segment) => segment.destroy());
    this.laserPlasma = [];
    this.leftGun.destroy();
    this.rightGun.destroy();

    this.warningLeft?.destroy();
    this.warningRight?.destroy();
  }

  destroyWarning() {
    // Если есть предупреждения, уничтожаем их
    this.warningLeft?.destroy();
    this.warningRight?.destroy();
  }
}
