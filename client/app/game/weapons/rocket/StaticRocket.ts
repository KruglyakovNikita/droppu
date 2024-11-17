// StaticRocket.ts
import { Rocket } from "./Rocket";

export class StaticRocket extends Rocket {
  constructor(scene: Phaser.Scene, x: number, y: number, speed: number) {
    super(scene, x, y, "staticRocketTexture", null, speed);
  }

  /**
   * Метод обновления ракеты
   * @param player Ссылка на игрока
   * @param delta Время с последнего кадра в миллисекундах
   */
  update(player: Phaser.GameObjects.Sprite) {
    super.update(player);
    // Дополнительное поведение не требуется; ракета движется влево с фиксированной скоростью
  }
}
