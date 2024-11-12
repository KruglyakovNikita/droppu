"use client";

import React, { useEffect, useRef } from "react";
import GameScene from "../game/GameScene";
import Phaser from "phaser";

const Game = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Проверяем, что код выполняется на клиенте
    if (
      typeof window === "undefined" ||
      !gameRef.current ||
      gameRef.current.childElementCount > 1
    ) {
      return;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 600,
      height: 400,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: true,
          fps: 60,
          timeScale: 1,
        },
      },
      scene: GameScene,
    };

    // Создаем экземпляр Phaser только на клиенте
    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} />;
};

export default Game;
