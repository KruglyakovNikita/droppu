export class ObjectPool<T extends Phaser.GameObjects.Image> {
  private pool: T[] = [];
  private factory: () => T;

  constructor(factory: () => T) {
    this.factory = factory;
  }

  acquire(): T {
    let obj = this.pool.find((o) => !o.active);
    if (obj) {
      obj.setActive(true);
      obj.setVisible(true);
    } else {
      obj = this.factory();
      this.pool.push(obj);
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
