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
      console.log("CREATEA LASER");

      obj = this.factory();
      this.pool.push(obj);
    }
    return obj;
  }

  release(obj: T) {
    console.log("DEACTIVATE");

    if ((obj as any).setActive) (obj as any).setActive(false);
    if ((obj as any).setVisible) (obj as any).setVisible(false);
  }

  releaseAll() {
    this.pool.forEach((obj) => {
      if ((obj as any).setActive) (obj as any).setActive(false);
      if ((obj as any).setVisible) (obj as any).setVisible(false);
    });
  }
}
