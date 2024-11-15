// HomingRocket.ts
import { Rocket } from "./Rocket";

export class HomingRocket extends Rocket {
  baseY: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: Phaser.GameObjects.Sprite,
    speed: number
  ) {
    super(scene, x, y, "homingRocketTexture", target, speed);
    this.baseY = y;
    this.x = x;
  }

  /**
   * Метод обновления ракеты
   * @param player Ссылка на игрока
   * @param delta Время с последнего кадра в миллисекундах
   */
  update(player: Phaser.GameObjects.Sprite, delta: number) {
    super.update(player, delta);
    // Ракета движется влево с фиксированной Y-координатой
    // this.setVelocityY(0); // Фиксируем скорость по оси Y
    // this.setPosition(this.x, this.baseY);
  }
}
