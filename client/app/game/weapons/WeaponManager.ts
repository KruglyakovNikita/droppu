// WeaponManager.ts
export class WeaponManager {
  scene: Phaser.Scene;
  objects: { type: string; instance: any; state: any }[];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.objects = [];
  }

  /**
   * Метод для добавления объекта (например, ракеты или лазера)
   * @param type Тип объекта (например, "rocket", "laser")
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
   * Метод обновления всех объектов
   * @param player Ссылка на игрока
   * @param delta Время с последнего кадра в миллисекундах
   */
  update(player: Phaser.GameObjects.Sprite, delta: number) {
    this.objects = this.objects.filter((obj) => {
      if (!obj.instance || !obj.instance.body) {
        // Удаляем объект, если его больше нет
        return false;
      }

      const isRocket = obj.type === "rocket";
      const isWarning = isRocket && obj.instance.isWarning;

      if (!isWarning) {
        const camera = this.scene.cameras.main;
        // Удаляем объекты, если они вышли за границы видимой области камеры
        if (
          obj.instance.x < camera.scrollX - 200 || // Левый край за пределами камеры
          obj.instance.x > camera.scrollX + camera.width + 200 || // Правый край за пределами камеры
          obj.instance.y <= camera.scrollY - 200 || // Верхний край за пределами камеры
          obj.instance.y >= camera.scrollY + camera.height + 200 // Нижний край за пределами камеры
        ) {
          console.log("Удаление объекта за пределами камеры:", obj.type);
          this.removeObject(obj.instance);
          return false;
        }
      }

      // Обновляем объект, если у него есть метод update
      if (obj.instance.update) {
        obj.instance.update(player, delta);
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
    return this.objects.filter((obj) => obj.type === type);
  }
}
