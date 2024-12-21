// Rocket.ts
type RocketType = "static" | "homing" | "dynamic";
type RocketSpriteType = "rocket_static" | "rocket_homing" | "rocket_dynamic";
type PointSpriteType = "point_static" | "point_homing" | "point_dynamic";

export class Rocket extends Phaser.Physics.Matter.Sprite {
  target?: Phaser.GameObjects.Sprite;
  speed: number;
  public isWarning: boolean = false; // Добавляем публичный флаг

  private updateWarningPosition: (() => void) | null = null;
  private warningDelayedCall: Phaser.Time.TimerEvent | null = null;
  private warningTriangle: Phaser.GameObjects.Sprite | null = null;
  rocketSprite: RocketSpriteType = "rocket_static";
  pointSprite: PointSpriteType = "point_static";

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Phaser.GameObjects.Sprite | null,
    speed: number,
    typeOfRocket: RocketType = "static"
  ) {
    let rocketSprite: RocketSpriteType = "rocket_static";
    let pointSprite: PointSpriteType = "point_static";

    if (typeOfRocket === "dynamic") {
      rocketSprite = "rocket_dynamic";
      pointSprite = "point_dynamic";
    } else if (typeOfRocket === "homing") {
      rocketSprite = "rocket_homing";
      pointSprite = "point_homing";
    } else {
      rocketSprite = "rocket_static";
      pointSprite = "point_static";
    }

    super(scene.matter.world, x, y, rocketSprite);
    this.scene = scene;
    if (target) {
      this.target = target;
    }
    this.speed = speed;

    this.pointSprite = pointSprite;
    this.rocketSprite = rocketSprite;

    this.scene.add.existing(this);

    // Изначально ракета невидима и неактивна
    this.setVisible(false);
    this.setActive(false);
    this.setIgnoreGravity(true);
    this.setFrictionAir(0); // Отключаем сопротивление воздуха
    this.setFriction(0); // Отключаем трение
    this.setFixedRotation();

    this.setRectangle(85, 30);
    this.setSensor(true);
  }

  /**
   * Метод для отображения предупреждающего треугольника и активации ракеты через 3 секунды
   * @param getX Функция для получения текущей X позиции треугольника
   * @param getY Функция для получения текущей Y позиции треугольника
   */
  setWarning(getX: () => number, getY: () => number) {
    this.isWarning = true;

    // Создаём треугольник-предупреждение
    this.warningTriangle = this.scene.matter.add.sprite(
      getX(),
      getY(),
      this.pointSprite
    );
    this.warningTriangle?.setDepth(1);
    this.warningTriangle.setDisplaySize(
      this.scene.scale.width * 0.02,
      this.scene.scale.height * 0.03
    );

    if (this.pointSprite) {
      this.warningTriangle.play(this.pointSprite);
    }

    // Обновляем позицию треугольника при обновлении сцены
    this.updateWarningPosition = () => {
      this.warningTriangle?.setX(getX());
      this.warningTriangle?.setY(getY());
    };
    this.scene.events.on("update", this.updateWarningPosition);

    // Удаляем треугольник через 3 секунды и активируем ракету
    this.warningDelayedCall = this.scene.time.delayedCall(
      3000,
      () => {
        if (this.scene && this.updateWarningPosition) {
          this.scene.events.off("update", this.updateWarningPosition);
          this.updateWarningPosition = null;
        }
        this.warningTriangle?.destroy();
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
    this.setPosition(getX() + 50, getY());

    if (this.rocketSprite) this.play(this.rocketSprite);

    // Делаем ракету видимой и активной
    this.setVisible(true);
    this.setActive(true);

    // Воспроизводим звук запуска ракеты
    this.scene.sound.play("rocketLaunch");

    // Задаем скорость ракете влево
    this.setVelocityX(-this.speed);
    this.setFrictionAir(0);
    this.setFriction(0);
    this.setVelocityY(0); // Фиксируем скорость по оси Y
    this.setSensor(true);
  }

  /**
   * Метод обновления ракеты
   * @param player Ссылка на игрока
   */
  update() {
    this.addTrail();
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
    this.warningTriangle?.destroy();
    // Вызываем базовый метод destroy
    super.destroy(fromScene);
  }
}
