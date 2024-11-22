import Phaser from "phaser";

// Константы для временных интервалов и настроек
const WARNING_DURATION = 3000; // Длительность предупреждающих треугольников в миллисекундах
const GUN_APPEAR_DURATION = 800; // Время появления пушек
const LASER_DURATION = 2000; // Длительность действия плазмы
const GUN_DISAPPEAR_DURATION = 500; // Время исчезновения пушек
const CAMER_GAP = 25;
const GUN_MOVE_DISTANCE = 50; // Насколько пушки заезжают в центр экрана
const PLASMA_SCREEN_X = 100; // Расстояние от левого края экрана до начала плазмы
const PLASMA_SCREEN_Y = 200; // Расстояние от верхнего края экрана до плазмы (можно настроить)

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

  constructor(
    scene: Phaser.Scene,
    type: "static" | "homing" | "dynamic",
    player: Phaser.Physics.Matter.Sprite
  ) {
    this.scene = scene;
    this.type = type;
    this.player = player;

    // Устанавливаем начальную позицию Y в зависимости от типа
    if (this.type === "static") {
      this.initialY = Phaser.Math.Between(50, this.scene.scale.height - 50);
    } else {
      // Для 'homing' и 'dynamic' будем следить за игроком
      this.initialY = this.player.y;
    }

    // Создаем лазерные пушки и позиционируем их за пределами экрана
    this.leftGun = this.scene.add.image(
      -GUN_MOVE_DISTANCE,
      this.initialY,
      "laserGun"
    );
    this.rightGun = this.scene.add.image(
      this.scene.cameras.main.width + GUN_MOVE_DISTANCE,
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

    // Для 'homing' и 'dynamic' следим за игроком
    if (this.type === "homing" || this.type === "dynamic") {
      this.updateWarningPosition = () => {
        this.initialY = this.player.y;
        this.warningLeft?.setY(this.initialY);
        this.warningRight?.setY(this.initialY);
      };
      this.scene.events.on("update", this.updateWarningPosition);
    }

    // Через WARNING_DURATION миллисекунд убираем предупреждения и готовимся стрелять
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

    // Анимируем выезд пушек на экран
    const leftGunTargetX = 0;
    const rightGunTargetX = this.scene.cameras.main.width;

    // Смещаем пушки внутрь экрана на заданное расстояние
    const leftGunFinalX = leftGunTargetX + GUN_MOVE_DISTANCE;
    const rightGunFinalX = rightGunTargetX - GUN_MOVE_DISTANCE;

    this.scene.tweens.add({
      targets: this.leftGun,
      x: leftGunFinalX,
      duration: GUN_APPEAR_DURATION,
      ease: "Power1",
      onComplete: () => {
        this.fireLaser();
      },
    });

    this.scene.tweens.add({
      targets: this.rightGun,
      x: rightGunFinalX,
      duration: GUN_APPEAR_DURATION,
      ease: "Power1",
      offset: 0, // Начинаем одновременно
    });
  }

  fireLaser() {
    // Создаем лазерную плазму

    // Позиции пушек уже должны быть на финальных позициях
    const cameraScrollX = this.scene.cameras.main.scrollX;
    const cameraScrollY = this.scene.cameras.main.scrollY;

    const leftGunX = this.leftGun.x + cameraScrollX;
    const rightGunX = this.rightGun.x + cameraScrollX;

    const plasmaHeight = 20;
    const laserLength = rightGunX - leftGunX - this.leftGun.displayWidth;

    // Создаем один большой сегмент плазмы между пушками
    const x = leftGunX + this.leftGun.displayWidth / 2 + laserLength / 2;
    const y = this.initialY + cameraScrollY;

    const segment = this.scene.matter.add.image(x, y, "laserPlazm", undefined, {
      isSensor: true,
      isStatic: true,
    });
    segment.setDisplaySize(laserLength, plasmaHeight);
    segment.setDepth(1);
    // Не привязываем плазму к камере
    // segment.setScrollFactor(0); // Убираем эту строку

    this.laserPlasma.push(segment);

    // Воспроизводим звук активации
    this.scene.sound.play("laserCannonActivate");

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

  deactivateLaser() {
    this.active = false;

    // Анимируем уход пушек за экран
    const leftGunExitX = -GUN_MOVE_DISTANCE;
    const rightGunExitX = this.scene.cameras.main.width + GUN_MOVE_DISTANCE;

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
        // После завершения анимации уничтожаем пушки
        this.destroy();
      },
    });

    // Воспроизводим звук деактивации
    this.scene.sound.play("laserCannonDeactivate");
  }

  update(player: Phaser.Physics.Matter.Sprite) {
    // Для 'dynamic' пушки двигаются вверх и вниз
    if (this.type === "dynamic" && this.active) {
      const time = this.scene.time.now / 1000;
      const waveOffsetY = 10 * Math.sin(time * 2 * Math.PI);
      let newY = this.initialY + waveOffsetY;
      newY = Phaser.Math.Clamp(newY, 50, this.scene.scale.height - 50);
      this.initialY = newY;
      this.leftGun.setY(this.initialY);
      this.rightGun.setY(this.initialY);

      // Обновляем позицию плазмы, чтобы она визуально оставалась на месте относительно камеры
      this.laserPlasma.forEach((segment) => {
        const desiredX = PLASMA_SCREEN_X;
        const desiredY = PLASMA_SCREEN_Y;
        const cameraScrollX = this.scene.cameras.main.scrollX;
        const cameraScrollY = this.scene.cameras.main.scrollY;
        const newX = cameraScrollX + desiredX;
        const newYPos = this.initialY + cameraScrollY; // Или используйте desiredY, если хотите фиксированную Y
        segment.setPosition(
          newX + (this.scene.cameras.main.width - PLASMA_SCREEN_X * 2) / 2,
          newYPos
        );
      });
    } else {
      // Если не 'dynamic', просто фиксируем плазму на месте относительно камеры
      this.laserPlasma.forEach((segment) => {
        const desiredX = PLASMA_SCREEN_X;
        const desiredY = this.initialY; // Или PLASMA_SCREEN_Y
        const cameraScrollX = this.scene.cameras.main.scrollX;
        const cameraScrollY = this.scene.cameras.main.scrollY;
        const newX = cameraScrollX + desiredX;
        const newYPos = desiredY + cameraScrollY;
        segment.setPosition(
          newX + (this.scene.cameras.main.width - PLASMA_SCREEN_X * 2) / 2,
          newYPos
        );
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
    // В данном классе нет предупреждений, так как они уничтожаются в startSequence
    // Если в будущем добавите предупреждения, реализуйте их уничтожение здесь
  }
}
