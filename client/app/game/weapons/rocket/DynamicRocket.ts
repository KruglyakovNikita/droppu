import { Rocket } from "./Rocket";

export class DynamicRocket extends Rocket {
  amplitude: number;
  baseY: number;
  time: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Phaser.GameObjects.Sprite,
    speed: number,
    amplitude: number
  ) {
    super(scene, x, y, "dynamicRocketTexture", target, speed);
    this.amplitude = amplitude;
    this.baseY = y;
    this.time = 0;
  }

  /**
   * Метод активации ракеты
   * @param getX Функция для получения текущей X позиции ракеты
   * @param getY Функция для получения текущей Y позиции ракеты
   */
  activate(getX: () => number, getY: () => number) {
    super.activate(getX, getY);
    this.baseY = getY();
  }

  update() {
    super.update();
    if (this.active) {
      if (this.active) {
        const currentTime = this.scene.time.now / 1000; // Получаем текущее время в секундах
        const waveOffsetY =
          this.amplitude * Math.sin((this.amplitude / 2) * currentTime); // Генерируем плавное смещение

        const newY = Phaser.Math.Clamp(this.baseY + waveOffsetY, 20, 380);

        // Устанавливаем новое положение по Y
        this.setY(newY);
        this.setVelocityY(0);
      }
    }
  }
}
