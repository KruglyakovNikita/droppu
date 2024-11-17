// LaserCannon.ts
import Phaser from "phaser";

export class LaserCannon {
  scene: Phaser.Scene;
  laser: Phaser.GameObjects.Rectangle;
  warningLeft: Phaser.GameObjects.Image;
  warningRight: Phaser.GameObjects.Image;
  active: boolean = false;
  timers: Phaser.Time.TimerEvent[] = [];
  private updateWarningPosition: (() => void) | null = null;
  private updateLaserPosition: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Инициализируем лазер, но делаем его невидимым
    this.laser = this.scene.add.rectangle(
      0,
      0,
      this.scene.cameras.main.width, // Ширина равна ширине камеры
      5, // Толщина лазера
      0xff0000 // Красный цвет
    );
    this.laser.setOrigin(0, 0.5);
    this.laser.setVisible(false);
    this.laser.setDepth(2); // Убедитесь, что он выше других элементов

    // Инициализируем предупреждающие треугольники с обеих сторон
    this.warningLeft = this.scene.add.image(0, 0, "warningTriangle");
    this.warningRight = this.scene.add.image(0, 0, "warningTriangle");
    this.warningLeft.setScale(0.5);
    this.warningRight.setScale(0.5);
    this.warningLeft.setAlpha(0.8);
    this.warningRight.setAlpha(0.8);
    this.warningLeft.setVisible(false);
    this.warningRight.setVisible(false);
    this.warningLeft.setDepth(2);
    this.warningRight.setDepth(2);

    // Запускаем последовательность активации
    this.startSequence();
  }

  /**
   * Запускает последовательность предупреждения и активации лазерной пушки
   */
  startSequence() {
    // Отображаем предупреждающие треугольники
    this.warningLeft.setVisible(true);
    this.warningRight.setVisible(true);

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

    // Функция для обновления позиций треугольников
    this.updateWarningPosition = () => {
      this.warningLeft.setPosition(
        this.scene.cameras.main.scrollX + 50,
        this.scene.scale.height / 2
      );
      this.warningRight.setPosition(
        this.scene.cameras.main.scrollX + this.scene.cameras.main.width - 50,
        this.scene.scale.height / 2
      );
    };
    this.scene.events.on("update", this.updateWarningPosition);

    // Через 3 секунды удаляем предупреждения и готовимся к выстрелу
    const warningTimer = this.scene.time.delayedCall(
      3000, // 3 секунды
      () => {
        this.warningLeft.setVisible(false);
        this.warningRight.setVisible(false);
        this.scene.tweens.killTweensOf([this.warningLeft, this.warningRight]);

        // Удаляем функцию обновления позиций треугольников
        if (this.updateWarningPosition) {
          this.scene.events.off("update", this.updateWarningPosition);
          this.updateWarningPosition = null;
        }

        // Запланируем выстрел лазера через 0.5 секунды
        const fireTimer = this.scene.time.delayedCall(
          500, // 0.5 секунды
          () => {
            this.fireLaser();
          },
          [],
          this
        );
        this.timers.push(fireTimer);
      },
      [],
      this
    );
    this.timers.push(warningTimer);
  }

  /**
   * Выстрел лазера через экран
   */
  fireLaser() {
    this.active = true;
    this.laser.setVisible(true);

    // Функция для обновления позиции лазера
    this.updateLaserPosition = () => {
      this.laser.setPosition(
        this.scene.cameras.main.scrollX,
        this.scene.scale.height / 2
      );
      this.laser.setSize(this.scene.cameras.main.width, 5); // Обновляем ширину лазера
    };
    this.updateLaserPosition();
    this.scene.events.on("update", this.updateLaserPosition);

    // Воспроизводим звук активации лазера
    this.scene.sound.play("laserCannonActivate");

    // Запланируем удаление лазера через 4 секунды
    const removeTimer = this.scene.time.delayedCall(
      4000, // 4 секунды
      () => {
        this.laser.setVisible(false);
        this.active = false;

        // Удаляем функцию обновления позиции лазера
        if (this.updateLaserPosition) {
          this.scene.events.off("update", this.updateLaserPosition);
          this.updateLaserPosition = null;
        }

        // Воспроизводим звук деактивации лазера
        this.scene.sound.play("laserCannonDeactivate");

        // Перезапускаем последовательность
        this.startSequence();
      },
      [],
      this
    );
    this.timers.push(removeTimer);
  }

  /**
   * Проверяет столкновение между лазером и игроком
   * @param player Ссылка на спрайт игрока
   */
  checkCollision(player: Phaser.GameObjects.Sprite) {
    if (
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.laser.getBounds(),
        player.getBounds()
      )
    ) {
      // Генерируем событие столкновения
      this.scene.events.emit("playerHit");
    }
  }

  /**
   * Обновляет позицию лазера и проверяет столкновение
   * @param player Ссылка на спрайт игрока
   * @param delta Время с последнего кадра в миллисекундах
   */
  update(player: Phaser.GameObjects.Sprite, delta: number) {
    if (this.active) {
      // Проверяем столкновение с игроком
      this.checkCollision(player);
    }
  }

  /**
   * Очищает все таймеры и игровые объекты
   */
  destroy() {
    this.timers.forEach((timer) => timer.remove(false));
    this.timers = [];

    if (this.updateWarningPosition) {
      this.scene.events.off("update", this.updateWarningPosition);
      this.updateWarningPosition = null;
    }

    if (this.updateLaserPosition) {
      this.scene.events.off("update", this.updateLaserPosition);
      this.updateLaserPosition = null;
    }

    this.laser.destroy();
    this.warningLeft.destroy();
    this.warningRight.destroy();
  }
}
