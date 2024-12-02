// Game.tsx
"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import GameScene from "../game/GameScene";
import Phaser from "phaser";
import GameData from "./GameData";
import {
  endGame,
  ICreatePurchaseAttempt,
  IEndGame,
  startGame,
} from "../lib/api/game";
import { useStore } from "../lib/store/store";

export interface GameSceneData {
  session_id: number;
  booster: number;
  userSkinUrl: string;
  userSpriteUrl: string;
  onGameEnd: () => void;
  onPurchaseAttempt: (
    body: ICreatePurchaseAttempt
  ) => Promise<"ok" | "canceled">;
}

const Game: FC<GameSceneData> = ({
  session_id,
  booster = 0,
  userSkinUrl,
  userSpriteUrl,
  onGameEnd,
  onPurchaseAttempt,
}) => {
  const setNavbarVisible = useStore((state) => state.setNavbarVisible);
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [isHorizontal, setIsHorizontal] = useState(
    window.innerHeight < window.innerWidth
  );
  const [gameWidth, setGameWidth] = useState(600);
  const [gameHeight, setGameHeight] = useState(400);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    setNavbarVisible(false);
    return () => setNavbarVisible(true);
  }, []);

  const calculateGameDimensions = () => {
    const maxWidth = 600;
    const minWidth = 450;
    const aspectRatio = 3 / 2;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Всегда рассматриваем игру в горизонтальном режиме
    if (height > width) {
      [width, height] = [height, width];
    }

    // Рассчитываем размеры игры с сохранением соотношения сторон
    let gameWidth = width;
    let gameHeight = width / aspectRatio;

    // Если высота игры превышает доступную высоту, корректируем ширину
    if (gameHeight > height) {
      gameHeight = height;
      gameWidth = height * aspectRatio;
    }

    // Ограничиваем размеры минимальными и максимальными значениями
    gameWidth = Math.min(Math.max(gameWidth, minWidth), maxWidth);
    gameHeight = Math.min(
      Math.max(gameHeight, minWidth / aspectRatio),
      maxWidth / aspectRatio
    );
    setGameWidth(Math.floor(gameWidth));
    setGameHeight(Math.floor(gameHeight));

    return {
      gameWidth: Math.floor(gameWidth),
      gameHeight: Math.floor(gameHeight),
    };
  };

  const resizeGame = () => {
    setIsHorizontal((prevState) => !prevState);
  };

  const startGameData = async () => {
    const data = await startGame({ game_type: "paid" });
    if (data?.session_id)
      GameData.instance.setProps({ session_id: data?.session_id });
    return data?.session_id ?? 100;
  };

  const handleGameEnd = async (body: IEndGame) => {
    setIsGameOver(true);
    const data = await endGame(body);
    if (data?.session_id)
      GameData.instance.setProps({ session_id: data?.session_id });

    if (onGameEnd) {
      onGameEnd();
    }
  };
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !gameRef.current ||
      gameRef.current.childElementCount > 0
    ) {
      return;
    }

    const initializeGame = async () => {
      const session_id = await startGameData(); // Дожидаемся завершения startGameData

      GameData.instance.setData({
        session_id,
        booster,
        userSkinUrl,
        userSpriteUrl,
        onGameEnd: handleGameEnd,
        onPurchaseAttempt,
      });

      const { gameWidth, gameHeight } = calculateGameDimensions();

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        parent: gameRef.current,
        physics: {
          default: "matter",
          matter: {
            gravity: { x: 0, y: 0 },
            positionIterations: 6,
            velocityIterations: 4,
          },
        },
        scene: GameScene,
        width: gameWidth,
        height: gameHeight,
        fps: {
          target: 60, // Максимальное количество FPS
          forceSetTimeOut: true, // Использовать setTimeout вместо requestAnimationFrame
        },
      };

      const game = new Phaser.Game(config);
      phaserGameRef.current = game;

      window.addEventListener("orientationchange", resizeGame);
    };

    initializeGame(); // Запускаем асинхронную инициализацию игры

    return () => {
      window.removeEventListener("orientationchange", resizeGame);
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isGameOver) {
      if (phaserGameRef.current) {
        phaserGameRef.current.scene.pause("GameScene");
      }
    }
  }, [isGameOver]);

  return (
    <div
      style={{
        position: "fixed",
        backgroundImage: "url('/map/gameSceneBackground.png')",
        backgroundRepeat: "repeat",
        backgroundSize: "auto",
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        top: 0,
        left: 0,
      }}
    >
      {!isGameOver && (
        <div
          style={{
            position: "absolute",
            top: `calc((100vh - ${gameHeight}px) / 2)`,
            left: `calc((100vw - ${gameWidth}px) / 2)`,
            width: gameWidth,
            height: gameHeight,
            overflow: "hidden",
            transform: isHorizontal ? "none" : "rotate(90deg)",
            margin: 0,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            outline: "8px ridge rgba(100, 150, 220, .9)",
            borderRadius: "2rem",
          }}
        >
          <div
            className="game"
            ref={gameRef}
            style={{
              outlineWidth: "3px",
              outlineColor: "green",
              outlineOffset: "3px",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Game;
