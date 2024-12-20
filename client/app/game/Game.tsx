// Game.tsx
"use client";

import React, { FC, useEffect, useRef, useState } from "react";
import GameScene from "../game/GameScene";
import Phaser from "phaser";
import GameData from "./GameData";
import {
  endGame,
  ICreatePayTicketAttempt,
  ICreatePurchaseAttempt,
  IEndGame,
  startGame,
} from "../lib/api/game";
import { useStore } from "../lib/store/store";
import "./Game.css";

export interface GameSceneData {
  session_id: number;
  booster: number;
  userSpriteUrl: string;
  onGameEnd: () => void;
  onPurchaseAttempt: (
    body: ICreatePurchaseAttempt
  ) => Promise<"ok" | "canceled">;
  payTicketForGame: (
    body: ICreatePayTicketAttempt
  ) => Promise<"ok" | "canceled">;
}

const Game: FC<GameSceneData> = ({
  session_id,
  booster = 0,
  userSpriteUrl,
  onGameEnd,
  onPurchaseAttempt,
  payTicketForGame,
}) => {
  const setNavbarVisible = useStore((state) => state.setNavbarVisible);
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [isHorizontal, setIsHorizontal] = useState(
    window.innerHeight < window.innerWidth
  );
  const [currentGameWidth, setCurentGameWidth] = useState<number>(-1);
  const [currentGameHeight, setCurrentGameHeight] = useState<number>(-1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Добавляем состояние загрузки

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
    const finalWidth = gameWidth - 10;
    const finalHeight = gameHeight - 20;

    setCurentGameWidth(Math.floor(finalWidth));
    setCurrentGameHeight(Math.floor(finalHeight));

    return {
      gameWidth: Math.floor(finalWidth),
      gameHeight: Math.floor(finalHeight),
    };
  };

  const resizeGame = () => {
    setIsHorizontal((prevState) => !prevState);
  };

  const startGameData = async () => {
    const data = await startGame({ game_type: "free" });
    if (data?.session_id)
      GameData.instance.setProps({ session_id: data?.session_id });
    return data?.session_id ?? 100;
  };

  const handleGameEnd = async (body: IEndGame) => {
    console.log("=======123=123=123=123=312=132=123=3=12");

    setIsGameOver(true);
    try {
      const data = await endGame(body);
      if (data?.session_id)
        GameData.instance.setProps({ session_id: data?.session_id });
    } catch (err) {}
    if (onGameEnd) {
      onGameEnd();
    }
  };

  const handleStartNextGameHandler = async (body: IEndGame) => {
    console.log("IM HERER");

    try {
      const data = await endGame(body);
      if (data?.session_id)
        GameData.instance.setProps({ session_id: data?.session_id });

      // if (onGameEnd) {
      //   onGameEnd();
      // }
      ///ТУТ НАДО ЧТОБ ПРИЛЕТАЛ НОВЫЙ session_id
      return { ...data, session_id: 505 };
    } catch (err) {
      if (onGameEnd) {
        setIsGameOver(true);
        onGameEnd();
      }
    }
  };

  function mockPaymentProcess(amount) {
    return new Promise((resolve, reject) => {
      console.log(`Processing payment of ${amount}...`);
      setTimeout(() => {
        // const isSuccess = Math.random() > 0.2; // 80% шанс успеха
        const isSuccess = false;
        if (isSuccess) {
          console.log("Payment successful!");
          resolve("ok");
        } else {
          console.log("Payment failed!");
          reject("canceled");
        }
      }, 500); // Задержка в 0.5 секунды
    });
  }

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !gameRef.current ||
      gameRef.current.childElementCount > 0
    ) {
      return;
    }

    const initializeGame = async () => {
      // Устанавливаем обратный вызов для уведомления о готовности игры
      GameData.instance.setOnGameReady(() => {
        setIsLoading(false); // Скрываем индикатор загрузки
      });

      const session_id = await startGameData(); // Дожидаемся завершения startGameData

      const payForGame = async () => {
        console.log(")*())()()()()()(()()()())(");

        await payTicketForGame({ session_id });
        // return await mockPaymentProcess(1);
      };
      GameData.instance.setData({
        session_id,
        booster,
        userSpriteUrl,
        onGameEnd: handleGameEnd,
        handleStartNextGame: handleStartNextGameHandler,
        onPurchaseAttempt,
        payTicketForGame: payForGame,
        game_type: "paid", // или "paid"
        hasTickets: true,
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
    };

    initializeGame(); // Запускаем асинхронную инициализацию игры

    return () => {
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

  console.log(currentGameHeight);
  console.log(currentGameWidth);

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
        userSelect: "none", // Отключаем выделение текста
        WebkitUserSelect: "none", // Для Safari
        touchAction: "none", // Отключаем стандартные действия при касании
      }}
      onContextMenu={(e) => e.preventDefault()} // Предотвращаем контекстное меню
    >
      {isLoading && (
        // Отображаем индикатор загрузки, пока isLoading = true
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div className="spinner" />
          <div style={{ color: "#ffffff", marginTop: "10px" }}>Загрузка...</div>
        </div>
      )}

      {!isGameOver && (
        <div
          style={{
            position: "absolute",
            top: `calc((100vh - ${currentGameHeight}px) / 2)`,
            left: `calc((100vw - ${currentGameWidth}px) / 2)`,
            width: currentGameWidth,
            height: currentGameHeight,
            overflow: "hidden",
            transform: isHorizontal ? "none" : "rotate(90deg)",
            margin: 0,
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            outline:
              currentGameWidth > 0 && currentGameWidth > 0
                ? "8px ridge rgba(100, 150, 220, .9)"
                : "",
            borderRadius:
              currentGameWidth > 0 && currentGameWidth > 0 ? "2rem" : "",
            userSelect: "none", // Отключаем выделение текста
            WebkitUserSelect: "none", // Для Safari
            touchAction: "none", // Отключаем стандартные действия при касании
          }}
          onContextMenu={(e) => e.preventDefault()} // Предотвращаем контекстное меню
        >
          <div
            className="game"
            ref={gameRef}
            style={{
              outlineWidth: "3px",
              outlineColor: "green",
              outlineOffset: "3px",
              userSelect: "none", // Отключаем выделение текста
              WebkitUserSelect: "none", // Для Safari
              touchAction: "none", // Отключаем стандартные действия при касании
              visibility: isLoading ? "hidden" : "visible",
            }}
            onContextMenu={(e) => e.preventDefault()} // Предотвращаем контекстное меню
          />
        </div>
      )}
    </div>
  );
};

export default Game;
