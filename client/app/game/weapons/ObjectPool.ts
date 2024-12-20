export class ObjectPool<T extends Phaser.GameObjects.Image> {
  private pool: T[] = [];
  private factory: () => T;

  constructor(factory: () => T) {
    this.factory = factory;
  }

  acquire(): T {
    let obj = this.pool?.find((o) => !o.active);
    if (obj) {
      obj.setActive(true);
      obj.setVisible(true);
    } else {
      console.log("CREATEA LASER");

      obj = this.factory();
      this.pool.push(obj);
    }

    return obj;
  }

  release(obj: T) {
    console.log("DEACTIVATE");

    if (obj.setActive) obj.setActive(false);
    if (obj.setVisible) obj.setVisible(false);
  }

  releaseAll() {
    this.pool.forEach((obj) => {
      if (obj.setActive) obj.setActive(false);
      if (obj.setVisible) obj.setVisible(false);
    });
  }

  destroyAll() {
    this.pool.forEach((obj) => {
      if (obj.destroy) obj.destroy();
    });
    this.pool = [];
  }
}
