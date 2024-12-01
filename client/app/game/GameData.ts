import { ICreatePurchaseAttempt, IEndGame } from "../lib/api/game";

export interface GameSceneData {
  session_id: number;
  booster: number;
  userSkinUrl: string;
  userSpriteUrl: string;
  onGameEnd: (body: IEndGame) => void;
  onPurchaseAttempt: (
    body: ICreatePurchaseAttempt
  ) => Promise<"ok" | "canceled">;
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

  setProps(data: Partial<GameSceneData>): void {
    this.data = { ...this.data, ...data };
  }

  getData(): GameSceneData {
    return this.data;
  }
}

export default GameData;
