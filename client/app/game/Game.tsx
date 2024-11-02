"use client";

import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "./GameScene";

export const Game = () => {
  const gameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gameRef.current) return;
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameRef.current,
      width: 400,
      height: 400,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: -15 },
          debug: true,
        },
      },
      fps: { target: 30, forceSetTimeOut: true },
      scene: GameScene,
    };

    const game = new Phaser.Game(config);
    return () => {
      game.destroy(true);
    };
  }, []);

  return <div ref={gameRef} />;
};
