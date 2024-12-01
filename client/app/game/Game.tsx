"use client";

import React, { CSSProperties, FC, useEffect, useRef, useState } from "react";
import GameScene from "../game/GameScene";
import Phaser from "phaser";
import { useStore } from "../lib/store/store";

export interface GameSceneData {
  gameId: string;
  booster: number;
  userSkinUrl: string;
  userSpriteUrl: string;
  onGameEnd: () => void;
}

const Game: FC<GameSceneData> = ({
  gameId,
  booster = 0,
  userSkinUrl,
  userSpriteUrl,
  onGameEnd,
}) => {
  const setNavbarVisible = useStore((state) => state.setNavbarVisible);
  const gameRef = useRef<HTMLDivElement>(null);
  const [isHorizontal, setIsHorizontal] = useState(
    window.innerHeight < window.innerWidth
  );
  const [gameWidth, setGameWidth] = useState(600);
  const [gameHeight, setGameHeight] = useState(400);

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

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !gameRef.current ||
      gameRef.current.childElementCount > 0
    ) {
      return;
    }

    const { gameWidth, gameHeight } = calculateGameDimensions();

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      physics: {
        default: "matter",
        matter: {
          gravity: { x: 0, y: 0 },
          // debug: true,
          positionIterations: 6,
          velocityIterations: 4,
        },
      },
      scene: GameScene,
      width: gameWidth,
      height: gameHeight,
    };

    const game = new Phaser.Game(config);

    window.addEventListener("orientationchange", resizeGame);

    return () => {
      window.removeEventListener("orientationchange", resizeGame);
      game.destroy(true);
    };
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        backgroundImage: "url('/map/gameSceneBackground.png')", // Указываем путь к изображению
        backgroundRepeat: "repeat", // Повторяем фон
        backgroundSize: "auto", // Размер изображения по умолчанию
        width: "100vw",
        height: "100vh",
        margin: 0,
        padding: 0,
        top: 0,
        left: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          ...(isHorizontal
            ? { top: `calc((100vh - ${gameHeight}px) / 2)` }
            : { top: `calc((100vh - ${gameHeight}px) / 2)` }),
          ...(isHorizontal
            ? { left: `calc((100vw - ${gameWidth}px) / 2)` }
            : { right: `calc((100vw - ${gameWidth}px) / 2)` }),
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
    </div>
  );
};

export default Game;
