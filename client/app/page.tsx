"use client";

import { useEffect, useState } from "react";
import { useStore } from "./lib/store/store";
import dynamic from "next/dynamic";
import UserAvatar from "./components/UserAvatar";
declare global {
  interface Window {
    Telegram?: any;
  }
}

const Game = dynamic(() => import("./game/Game"), { ssr: false });

const Home = () => {
  // Функция для отправки запроса на авторизацию или регистрацию
  const authenticate = async () => {
    try {
      const response = await fetch("api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "exampleUser",
          password: "examplePass",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Обновляем состояние на клиенте
      } else {
        console.error("Ошибка регистрации:", data.message);
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  useEffect(() => {
    // authenticate();
  }, []);

  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        if (tg.initDataUnsafe) setTelegramUser(tg.initDataUnsafe.user);
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return (
    <div>
      <h1>Telegram User Information</h1>
      {telegramUser ? (
        <div>
          <p>
            <strong>First Name:</strong> {telegramUser?.first_name}
          </p>
          <p>
            <strong>Last Name:</strong> {telegramUser?.last_name}
          </p>
          <p>
            <strong>Username:</strong> {telegramUser?.username}
          </p>
          <p>
            <strong>Language Code:</strong> {telegramUser?.language_code}
          </p>
          <p>
            <strong>User ID:</strong> {telegramUser?.id}
          </p>
          <UserAvatar avatarUrl={telegramUser?.photo_url} />
        </div>
      ) : (
        <p>No Telegram user data available.</p>
      )}
      {/* <Game /> */}
    </div>
  );
};

export default Home;
