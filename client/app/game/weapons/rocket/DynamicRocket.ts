// DynamicRocket.ts
import { Rocket } from "./Rocket";

export class DynamicRocket extends Rocket {
  amplitude: number;
  frequency: number;
  baseY: number;
  time: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Phaser.GameObjects.Sprite,
    speed: number,
    amplitude: number,
    frequency: number
  ) {
    super(scene, x, y, "dynamicRocketTexture", target, speed);
    this.amplitude = amplitude;
    this.frequency = frequency;
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

  /**
   * Метод обновления ракеты с волнообразным движением и ограничением по Y
   * @param player Ссылка на игрока
   * @param delta Время с последнего кадра в миллисекундах
   */
  update(player: Phaser.GameObjects.Sprite, delta: number) {
    super.update(player);
    if (this.active) {
      this.time += delta / 1000; // Преобразуем delta из мс в секунды
      const waveOffsetY =
        this.amplitude * Math.sin(this.frequency * this.time * Math.PI * 2);

      this.setPosition(this.x, this.baseY + waveOffsetY);

      let newY = this.baseY + waveOffsetY;

      newY = Phaser.Math.Clamp(newY, 20, 380);
      this.setY(newY);
    }
  }
}
