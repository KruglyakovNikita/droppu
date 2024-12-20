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
    super(scene, x, y, target, speed, "homing");
    this.baseY = y;
    this.x = x;
  }

  update() {
    super.update();
    // Ракета движется влево с фиксированной Y-координатой
    // this.setVelocityY(0); // Фиксируем скорость по оси Y
    // this.setPosition(this.x, this.baseY);
  }
}
