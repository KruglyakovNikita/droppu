// StaticRocket.ts
import { Rocket } from "./Rocket";

export class StaticRocket extends Rocket {
  constructor(scene: Phaser.Scene, x: number, y: number, speed: number) {
    super(scene, x, y, null, speed, "static");
  }

  update() {
    super.update();
    // Дополнительное поведение не требуется; ракета движется влево с фиксированной скоростью
  }
}
