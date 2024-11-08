"use client";

import { useEffect, useState } from "react";
import UserAvatar from "../app/components/UserAvatar";
import { useStore } from "../app/lib/store/store";

declare global {
  interface Window {
    Telegram?: any;
  }
}

const Home = () => {
  const setUser = useStore((state) => state.setUser);
  const setAchievements = useStore((state) => state.setAchievements);
  const userInfo = useStore((state) => state.user);
  const userAchievements = useStore((state) => state.achievements);
  const [telegramUser, setTelegramUser] = useState<any>(null);

  const authenticate = async (initData: any) => {
    try {
      const response = await fetch("/api/auth/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ init_data: JSON.stringify(initData) }),
      });

      const data = await response?.json();

      if (response.ok) {
        setUser(data.user);
        getAchievements();
      } else {
        console.error("Ошибка регистрации:", data.message);
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  const getAchievements = async () => {
    try {
      const response = await fetch("/api/achievements", {
        method: "GET",
      });

      const data = await response?.json();
      if (response.ok) {
        setAchievements(data.achievements);
      } else {
        console.error("Ошибка получения достижений:", data.message);
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-web-app.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        if (tg.initDataUnsafe) {
          setTelegramUser(tg.initDataUnsafe.user);
          authenticate(tg.initDataUnsafe);
        }
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // useEffect(() => {
  //   if (userInfo) getAchievements();
  // }, [userInfo, getAchievements]);

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
      <p>{JSON.stringify(userAchievements)}</p>
    </div>
  );
};

export default Home;
