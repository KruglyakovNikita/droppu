export class WeaponManager {
  scene: Phaser.Scene;
  objects: { type: string; instance: any; state: any }[];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.objects = [];
  }

  /**
   * Метод для добавления объекта (например, ракеты или лазера)
   * @param type Тип объекта (например, "rocket", "laserCannon")
   * @param instance Экземпляр объекта
   * @param state Дополнительное состояние объекта
   */
  addObject(type: string, instance: any, state: any) {
    this.objects.push({ type, instance, state });
  }

  /**
   * Метод для удаления объекта
   * @param instance Экземпляр объекта, который нужно удалить
   */
  removeObject(instance: any) {
    this.objects = this.objects.filter((obj) => obj.instance !== instance);
    instance.destroy();
  }

  /**
   * Метод для удаления всех объектов
   */
  removeAllObjects() {
    this.objects.forEach((obj) => {
      if (obj.instance.destroy) {
        obj.instance.destroy();
      }
    });
    console.log("All objects removed from WeaponManager.");
    this.objects = [];
  }

  stopAllObjects() {
    this.objects.forEach((obj) => {
      if (obj.instance.setActive) {
        obj.instance.setActive(false);
      }
    });
    console.log("All objects removed from WeaponManager.");
    this.objects = [];
  }

  update(player: Phaser.GameObjects.Sprite) {
    this.objects = this.objects.filter((obj) => {
      if (!obj.instance) {
        // Удаляем объект, если его больше нет
        return false;
      }

      if (obj.instance.body) {
        const camera = this.scene.cameras.main;
        // Удаляем объекты, если они вышли за границы видимой области камеры
        if (
          obj.instance.x < camera.scrollX - 200 || // Левый край за пределами камеры
          obj.instance.x > camera.scrollX + camera.width + 200 || // Правый край за пределами камеры
          obj.instance.y <= camera.scrollY || // Верхний край за пределами камеры
          obj.instance.y >= camera.scrollY + camera.height // Нижний край за пределами камеры
        ) {
          this.removeObject(obj.instance);
          return false;
        }
      }

      // Обновляем объект, если у него есть метод update
      if (obj.instance.update) {
        obj.instance.update(player); // Передаем игрока для обновления
      }

      return true;
    });
  }

  /**
   * Получение всех объектов определенного типа
   * @param type Тип объектов, которые нужно получить
   * @returns Массив объектов заданного типа
   */
  getObjectsByType(type: string) {
    const filteredObjects = this.objects.filter((obj) => obj.type === type);
    return filteredObjects;
  }
}
