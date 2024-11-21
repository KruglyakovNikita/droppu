import Phaser from "phaser";

const CAMER_GAP = 25;

export class LaserCannon {
  scene: Phaser.Scene;
  laserPlasma: Phaser.Physics.Matter.Image[] = [];
  leftGun: Phaser.GameObjects.Image;
  rightGun: Phaser.GameObjects.Image;

  warningRight: Phaser.GameObjects.Image | undefined;
  warningLeft: Phaser.GameObjects.Image | undefined;
  active: boolean = false;
  timers: Phaser.Time.TimerEvent[] = [];
  private updateLaserPosition: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Создаем лазерные пушки
    this.leftGun = this.scene.add.image(0, 0, "laserGun");
    this.rightGun = this.scene.add.image(0, 0, "laserGun");
    this.leftGun.setScale(0.5);
    this.rightGun.setScale(0.5);
    this.leftGun.setVisible(false);
    this.rightGun.setVisible(false);
    this.rightGun.setFlipX(true); // Зеркально разворачиваем правую пушку
    this.leftGun.setDepth(2);
    this.rightGun.setDepth(2);

    // Запускаем последовательность активации
    this.startSequence();
  }

  /**
   * Запускает последовательность предупреждения и активации лазерной пушки
   */
  startSequence() {
    // Отображаем предупреждающие треугольники
    this.warningLeft = this.scene.add.image(
      CAMER_GAP,
      this.scene.scale.height / 2,
      "warningTriangle"
    );
    this.warningRight = this.scene.add.image(
      this.scene.cameras.main.width - CAMER_GAP,
      this.scene.scale.height / 2,
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

    // Отключаем прокрутку треугольников
    this.warningLeft.setScrollFactor(0);
    this.warningRight.setScrollFactor(0);

    // Воспроизводим звук предупреждения
    this.scene.sound.play("laserCannonWarning");

    // Добавляем мигание треугольникам
    this.scene.tweens.add({
      targets: [this.warningLeft, this.warningRight],
      alpha: { from: 0.8, to: 0 },
      ease: "Linear",
      duration: 300,
      repeat: -1,
      yoyo: true,
    });

    // Через 3 секунды удаляем предупреждения и готовимся к выстрелу
    const warningTimer = this.scene.time.delayedCall(
      3000, // 3 секунды
      () => {
        this.warningLeft?.destroy();
        this.warningRight?.destroy();

        // Активируем лазеры
        this.fireLaser();
      },
      [],
      this
    );
    this.timers.push(warningTimer);
  }

  /**
   * Активирует лазер, заполняя его "плазмой"
   */
  fireLaser() {
    this.active = true;

    // Показываем лазерные пушки
    this.leftGun.setVisible(true);
    this.rightGun.setVisible(true);

    // Создаем лазерную плазму
    const plasmaWidth = 40; // Ширина одного сегмента плазмы
    const plasmaHeight = 20; // Высота сегмента плазмы
    const laserLength = this.scene.cameras.main.width - 100; // Длина лазера

    // Расчет количества сегментов и оставшегося пространства
    const segmentCount = Math.floor(laserLength / plasmaWidth);
    const remainingSpace = laserLength % plasmaWidth;

    // Удаляем старую плазму, если она есть
    this.laserPlasma.forEach((segment) => segment.destroy());
    this.laserPlasma = [];

    // Добавляем новые сегменты плазмы с физическими телами
    for (let i = 0; i < segmentCount; i++) {
      const x =
        this.scene.cameras.main.scrollX +
        50 +
        i * plasmaWidth +
        plasmaWidth / 2;
      const y = this.scene.scale.height / 2;

      const segment = this.scene.matter.add.image(
        x,
        y,
        "laserPlazm",
        undefined,
        {
          isSensor: true, // Сенсорное тело, чтобы не блокировать движение
          isStatic: true, // Неподвижное тело
        }
      );
      segment.setDisplaySize(plasmaWidth, plasmaHeight);
      segment.setDepth(1);

      this.laserPlasma.push(segment);
    }

    // Добавляем дополнительный сегмент, если есть оставшееся пространство
    if (remainingSpace > 0) {
      const x =
        this.scene.cameras.main.scrollX +
        50 +
        segmentCount * plasmaWidth +
        remainingSpace / 2;
      const y = this.scene.scale.height / 2;

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

    // Воспроизводим звук активации лазера
    this.scene.sound.play("laserCannonActivate");

    // Постоянное обновление позиций пушек и плазмы
    this.updateLaserPosition = () => {
      const scrollX = this.scene.cameras.main.scrollX;
      const centerY = this.scene.scale.height / 2;

      // Обновляем позиции пушек
      this.leftGun?.setPosition(scrollX + 50, centerY);
      this.rightGun?.setPosition(
        scrollX + this.scene.cameras.main.width - 50,
        centerY
      );

      // Обновляем позиции сегментов плазмы
      this.laserPlasma?.forEach((segment, i) => {
        const x = scrollX + 50 + i * plasmaWidth + plasmaWidth / 2;
        segment?.setPosition(x, centerY);
      });
    };
    this.scene.events.on("update", this.updateLaserPosition);

    // Убираем лазер через 4 секунды
    const removeTimer = this.scene.time.delayedCall(
      4000, // 4 секунды
      () => {
        this.deactivateLaser();
      },
      [],
      this
    );
    this.timers.push(removeTimer);
  }

  /**
   * Деактивирует лазер и запускает новую последовательность
   */
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

    // Воспроизводим звук деактивации лазера
    this.scene.sound.play("laserCannonDeactivate");

    // Дополнительно уничтожаем LaserCannon, если нужно
    this.destroy();
  }

  /**
   * Обновляет состояние лазерной пушки
   * @param player Ссылка на спрайт игрока
   */
  update(player: Phaser.Physics.Matter.Sprite) {
    //Update
  }

  /**
   * Очищает все таймеры и игровые объекты
   */
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

  /**
   * Метод для уничтожения активных предупреждений
   */
  destroyWarning() {
    // В данном классе нет предупреждений, так как они уничтожаются в startSequence
    // Если в будущем добавите предупреждения, реализуйте их уничтожение здесь
  }
}
