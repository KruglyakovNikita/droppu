// GameData.ts
class GameData {
  private static _instance: GameData;
  private data: any = {};
  private onGameReadyCallback: (() => void) | null = null;

  private constructor() {}

  static get instance() {
    if (!this._instance) {
      this._instance = new GameData();
    }
    return this._instance;
  }

  setData(newData: any) {
    this.data = newData;
  }

  getData() {
    return this.data;
  }

  setProps(props: any) {
    this.data = { ...this.data, ...props };
  }

  setOnGameReady(callback: () => void) {
    this.onGameReadyCallback = callback;
  }

  notifyGameReady() {
    if (this.onGameReadyCallback) {
      this.onGameReadyCallback();
      this.onGameReadyCallback = null; // Предотвращаем многократные вызовы
    }
  }
}

export default GameData;
