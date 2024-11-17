// LaserCannon.ts
import Phaser from "phaser";

export class LaserCannon {
  scene: Phaser.Scene;
  laserCannon: Phaser.Physics.Matter.Image;
  warningLeft: Phaser.GameObjects.Image;
  warningRight: Phaser.GameObjects.Image;
  active: boolean = false;
  timers: Phaser.Time.TimerEvent[] = [];
  private updateWarningPosition: (() => void) | null = null;
  private updateLaserPosition: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Инициализируем лазер, но делаем его невидимым
    this.laserCannon = this.scene.matter.add.image(
      0,
      0,
      "", // Пустая текстура, так как мы будем использовать только физическое тело
      undefined,
      { isStatic: true, isSensor: true } // Статичное сенсорное тело
    );
    this.laserCannon.setOrigin(0, 0.5);
    this.laserCannon.setVisible(false);
    this.laserCannon.setDepth(2);

    // Устанавливаем физическое тело вручную
    this.laserCannon.setBody({
      type: "rectangle",
      width: this.scene.cameras.main.width,
      height: 5,
    });

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
        this.scene.cameras.main.scrollX + 25,
        this.scene.scale.height / 2
      );
      this.warningRight.setPosition(
        this.scene.cameras.main.scrollX + this.scene.cameras.main.width - 25,
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
    this.laserCannon.setVisible(true);

    // Функция для обновления позиции лазера
    this.updateLaserPosition = () => {
      this.laserCannon.setPosition(
        this.scene.cameras.main.scrollX,
        this.scene.scale.height / 2
      );
      this.laserCannon.setSize(this.scene.cameras.main.width, 5); // Обновляем ширину лазера
    };
    this.updateLaserPosition();
    this.scene.events.on("update", this.updateLaserPosition);

    // Воспроизводим звук активации лазера
    this.scene.sound.play("laserCannonActivate");

    // Запланируем удаление лазера через 4 секунды
    const removeTimer = this.scene.time.delayedCall(
      4000, // 4 секунды
      () => {
        this.laserCannon.setVisible(false);
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
      this.active && // Проверяем, активен ли лазер
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.laserCannon.getBounds(),
        player.getBounds()
      )
    ) {
      this.scene.events.emit("playerHit"); // Вызываем событие смерти игрока
    }
  }

  /**
   * Обновляет состояние лазерной пушки
   * @param player Ссылка на спрайт игрока
   */
  update(player: Phaser.GameObjects.Sprite) {
    this.checkCollision(player);
  }

  /**
   * Метод для уничтожения активных предупреждений и очистки ресурсов
   */
  destroyWarning() {
    // Скрываем и уничтожаем предупреждающие треугольники, если они видимы
    if (this.warningLeft.visible) {
      this.warningLeft.setVisible(false);
      this.warningLeft.destroy();
    }
    if (this.warningRight.visible) {
      this.warningRight.setVisible(false);
      this.warningRight.destroy();
    }

    // Останавливаем все твины, связанные с предупреждениями
    this.scene.tweens.killTweensOf([this.warningLeft, this.warningRight]);

    // Удаляем все таймеры, связанные с предупреждениями
    this.timers.forEach((timer) => timer.remove(false));
    this.timers = [];

    // Удаляем обработчик обновления позиций треугольников
    if (this.updateWarningPosition) {
      this.scene.events.off("update", this.updateWarningPosition);
      this.updateWarningPosition = null;
    }
  }

  /**
   * Очищает все таймеры и игровые объекты
   */
  destroy() {
    this.destroyWarning(); // Убедитесь, что предупреждения уничтожены
    this.laserCannon.destroy();
  }
}
