export class ObjectPool<T extends Phaser.GameObjects.Image> {
  private pool: T[] = [];
  private scene: Phaser.Scene;
  private factory: () => T;

  constructor(scene: Phaser.Scene, factory: () => T) {
    this.scene = scene;
    this.factory = factory;
  }

  acquire(): T {
    let obj = this.pool.find((o) => !o.active);
    if (obj) {
      obj.setActive(true);
      obj.setVisible(true);
    } else {
      obj = this.factory();
    }
    return obj;
  }

  release(obj: T) {
    obj.setActive(false);
    obj.setVisible(false);
  }

  releaseAll() {
    this.pool.forEach((obj) => {
      obj.setActive(false);
      obj.setVisible(false);
    });
  }
}
