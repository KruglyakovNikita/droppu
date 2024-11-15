// Rocket.ts
export class Rocket extends Phaser.Physics.Matter.Sprite {
  target?: Phaser.GameObjects.Sprite;
  speed: number;
  public isWarning: boolean = false; // Добавляем публичный флаг

  private updateWarningPosition: (() => void) | null = null;
  private warningDelayedCall: Phaser.Time.TimerEvent | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    target: Phaser.GameObjects.Sprite | null,
    speed: number
  ) {
    super(scene.matter.world, x, y, texture);
    this.scene = scene;
    if (target) {
      this.target = target;
    }
    this.speed = speed;

    this.scene.add.existing(this);

    // Изначально ракета невидима и неактивна
    this.setVisible(false);
    this.setActive(false);
    this.setIgnoreGravity(true);
    this.setFrictionAir(0); // Отключаем сопротивление воздуха
    this.setFriction(0); // Отключаем трение
  }

  /**
   * Метод для отображения предупреждающего треугольника и активации ракеты через 3 секунды
   * @param getX Функция для получения текущей X позиции треугольника
   * @param getY Функция для получения текущей Y позиции треугольника
   */
  setWarning(getX: () => number, getY: () => number) {
    this.isWarning = true; // Устанавливаем флаг

    console.log("Rocket setWarning called:", this);

    // Создаём треугольник-предупреждение
    const warningTriangle = this.scene.add.image(
      getX(),
      getY(),
      "warningTriangle"
    );
    warningTriangle.setScale(0.5);
    warningTriangle.setAlpha(0.8);
    warningTriangle.setDepth(1); // Убедимся, что треугольник выше других элементов

    // Добавляем мигание треугольника
    this.scene.tweens.add({
      targets: warningTriangle,
      alpha: { start: 0.8, to: 0 },
      ease: "Linear",
      duration: 300,
      repeat: -1,
      yoyo: true,
    });

    // Обновляем позицию треугольника при обновлении сцены
    this.updateWarningPosition = () => {
      warningTriangle.setX(getX());
      warningTriangle.setY(getY());
    };
    this.scene.events.on("update", this.updateWarningPosition);

    // Удаляем треугольник через 3 секунды и активируем ракету
    this.warningDelayedCall = this.scene.time.delayedCall(
      3000,
      () => {
        console.log("Delayed call executed for Rocket:", this);
        if (this.scene && this.updateWarningPosition) {
          this.scene.events.off("update", this.updateWarningPosition);
          this.updateWarningPosition = null;
        }
        warningTriangle.destroy();
        this.activate(getX, getY); // Активируем ракету с установкой позиции
      },
      [],
      this
    );
  }

  /**
   * Метод для активации ракеты: делает её видимой, активной и задает скорость
   * @param getX Функция для получения текущей X позиции ракеты
   * @param getY Функция для получения текущей Y позиции ракеты
   */
  activate(getX: () => number, getY: () => number) {
    this.isWarning = false; // Снимаем флаг

    console.log("Rocket activate called:", this);

    // Устанавливаем начальную позицию ракеты
    this.setPosition(getX(), getY());

    // Делаем ракету видимой и активной
    this.setVisible(true);
    this.setActive(true);

    // Воспроизводим звук запуска ракеты
    this.scene.sound.play("rocketLaunch");

    // Задаем скорость ракете влево
    this.setVelocityX(-this.speed);
    this.setVelocityY(0); // Фиксируем скорость по оси Y
  }

  /**
   * Метод обновления ракеты
   * @param player Ссылка на игрока
   * @param delta Время с последнего кадра в миллисекундах
   */
  update(player: Phaser.GameObjects.Sprite, delta: number) {
    this.checkCollisionWithPlayer(player);
    this.addTrail();
  }

  /**
   * Метод для проверки столкновений с игроком
   * @param player Ссылка на игрока
   */
  checkCollisionWithPlayer(player: Phaser.GameObjects.Sprite) {
    if (
      Phaser.Geom.Intersects.RectangleToRectangle(
        this.getBounds(),
        player.getBounds()
      )
    ) {
      // Смертельное столкновение
      this.scene.events.emit("playerHit");
      this.destroy();
    }
  }

  /**
   * Метод для визуальных эффектов (например, дым)
   */
  addTrail() {
    // Реализуйте визуальные эффекты при необходимости
  }

  /**
   * Переопределение метода destroy для очистки ресурсов
   * @param fromScene Указывает, уничтожается ли объект из сцены
   */
  destroy(fromScene?: boolean) {
    // Отменяем таймер, если он существует
    if (this.warningDelayedCall) {
      this.warningDelayedCall.remove(false);
      this.warningDelayedCall = null;
    }

    // Удаляем обработчик обновления позиции треугольника
    if (this.scene && this.updateWarningPosition) {
      this.scene.events.off("update", this.updateWarningPosition);
      this.updateWarningPosition = null;
    }

    console.log("Rocket destroyed:", this);

    // Вызываем базовый метод destroy
    super.destroy(fromScene);
  }
}
