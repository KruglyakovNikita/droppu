export interface GameSceneData {
  gameId: string;
  booster: number;
  userSkinUrl: string;
  userSpriteUrl: string;
  onGameEnd: () => void;
}

class GameData {
  private static _instance: GameData;
  data!: GameSceneData;

  constructor() {
    this.data = {
      gameId: "1",
      booster: 0,
      userSkinUrl: "/player/granny1.png",
      userSpriteUrl: "/player/granny2.png",
      onGameEnd: () => {
        console.log("WATAFAC");
        window?.Telegram?.WebApp?.exitFullscreen();
      },
    };
  }

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
