export interface GameSceneData {
  gameId: string;
  booster: number;
  userSkinUrl: string;
  userSpriteUrl: string;
  onGameEnd: () => void;
  onPurchaseAttempt: (cost: number) => Promise<"ok" | "canceled">;
}

class GameData {
  private static _instance: GameData;
  data!: GameSceneData;

  private constructor() {}

  static get instance(): GameData {
    if (!this._instance) {
      this._instance = new GameData();
    }
    return this._instance;
  }

  setData(data: GameSceneData): void {
    this.data = data;
  }

  getData(): GameSceneData {
    return this.data;
  }
}

export default GameData;
