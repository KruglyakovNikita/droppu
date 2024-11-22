import Phaser from "phaser";

const CAMER_GAP = 25;

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
  private updateLaserPosition: (() => void) | null = null;
  type: string;
  initialY: number;

  constructor(
    scene: Phaser.Scene,
    type: string,
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

    // Создаем лазерные пушки
    this.leftGun = this.scene.add.image(0, 0, "laserGun");
    this.rightGun = this.scene.add.image(0, 0, "laserGun");
    this.leftGun.setScale(0.5);
    this.rightGun.setScale(0.5);
    this.leftGun.setVisible(false);
    this.rightGun.setVisible(false);
    this.rightGun.setFlipX(true);
    this.leftGun.setDepth(2);
    this.rightGun.setDepth(2);

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

    // Через 3 секунды убираем предупреждения и готовимся стрелять
    const warningTimer = this.scene.time.delayedCall(
      3000,
      () => {
        this.warningLeft?.destroy();
        this.warningRight?.destroy();

        if (this.updateWarningPosition) {
          this.scene.events.off("update", this.updateWarningPosition);
          this.updateWarningPosition = null;
        }

        if (this.type === "homing" || this.type === "dynamic") {
          // Ждем 0.5 секунды перед выстрелом
          const fireDelayTimer = this.scene.time.delayedCall(
            500,
            () => {
              this.fireLaser();
            },
            [],
            this
          );
          this.timers.push(fireDelayTimer);
        } else {
          // Для 'static' стреляем сразу
          this.fireLaser();
        }
      },
      [],
      this
    );
    this.timers.push(warningTimer);
  }

  fireLaser() {
    this.active = true;

    // Показываем лазерные пушки
    this.leftGun.setVisible(true);
    this.rightGun.setVisible(true);

    // Создаем лазерную плазму
    const plasmaWidth = 40;
    const plasmaHeight = 20;
    const laserLength = this.scene.cameras.main.width - 100;

    const segmentCount = Math.floor(laserLength / plasmaWidth);
    const remainingSpace = laserLength % plasmaWidth;

    this.laserPlasma.forEach((segment) => segment.destroy());
    this.laserPlasma = [];

    for (let i = 0; i < segmentCount; i++) {
      const x =
        this.scene.cameras.main.scrollX +
        50 +
        i * plasmaWidth +
        plasmaWidth / 2;
      const y = this.initialY;

      const segment = this.scene.matter.add.image(
        x,
        y,
        "laserPlazm",
        undefined,
        {
          isSensor: true,
          isStatic: true,
        }
      );
      segment.setDisplaySize(plasmaWidth, plasmaHeight);
      segment.setDepth(1);

      this.laserPlasma.push(segment);
    }

    if (remainingSpace > 0) {
      const x =
        this.scene.cameras.main.scrollX +
        50 +
        segmentCount * plasmaWidth +
        remainingSpace / 2;
      const y = this.initialY;

      const segment = this.scene.matter.add.image(
        x,
        y,
        "laserPlazm",
        undefined,
        {
          isSensor: true,
          isStatic: true,
        }
      );
      segment.setDisplaySize(remainingSpace, plasmaHeight);
      segment.setDepth(1);

      this.laserPlasma.push(segment);
    }

    // Воспроизводим звук активации
    this.scene.sound.play("laserCannonActivate");

    // Обновляем позиции лазерных пушек и плазмы
    this.updateLaserPosition = () => {
      const scrollX = this.scene.cameras.main.scrollX;

      // Обновляем позиции пушек
      this.leftGun?.setPosition(scrollX + 50, this.initialY);
      this.rightGun?.setPosition(
        scrollX + this.scene.cameras.main.width - 50,
        this.initialY
      );

      // Обновляем позиции плазмы
      this.laserPlasma?.forEach((segment, i) => {
        const x = scrollX + 50 + i * plasmaWidth + plasmaWidth / 2;
        segment?.setPosition(x, this.initialY);
      });
    };
    this.scene.events.on("update", this.updateLaserPosition);

    // Через 4 секунды деактивируем лазер
    const removeTimer = this.scene.time.delayedCall(
      4000,
      () => {
        this.deactivateLaser();
      },
      [],
      this
    );
    this.timers.push(removeTimer);
  }

  deactivateLaser() {
    this.active = false;

    // Удаляем лазерную плазму
    this.laserPlasma.forEach((segment) => segment.destroy());
    this.laserPlasma = [];

    // Скрываем лазерные пушки
    this.leftGun.setVisible(false);
    this.rightGun.setVisible(false);

    // Убираем обновление позиций
    if (this.updateLaserPosition) {
      this.scene.events.off("update", this.updateLaserPosition);
      this.updateLaserPosition = null;
    }

    // Воспроизводим звук деактивации
    this.scene.sound.play("laserCannonDeactivate");

    // Уничтожаем экземпляр LaserCannon
    this.destroy();
  }

  update(player: Phaser.Physics.Matter.Sprite) {
    if (this.type === "dynamic" && this.active) {
      // Двигаем лазерную пушку вверх и вниз в пределах 20 пикселей
      const time = this.scene.time.now / 1000;
      const waveOffsetY = 10 * Math.sin(time * 2 * Math.PI);
      let newY = this.initialY + waveOffsetY;
      newY = Phaser.Math.Clamp(newY, 0 + 50, this.scene.scale.height - 50);
      this.initialY = newY;
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
    this.warningLeft?.destroy();
    this.warningRight?.destroy();
    if (this.updateWarningPosition) {
      this.scene.events.off("update", this.updateWarningPosition);
      this.updateWarningPosition = null;
    }
  }
}
