"use client";

import { useEffect, useState } from "react";
import UserAvatar from "../app/components/UserAvatar";
import { useStore } from "../app/lib/store/store";
import { initUser } from "@/app/lib/api/user";
import { getAchievements } from "@/app/lib/api/achievements";

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

  const authenticate = async (initData: string) => {
    try {
      const response = await initUser(initData);
      const data = response.data;

      if (data) {
        setUser(data.user);
        getAchievement();
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  const getAchievement = async () => {
    try {
      const response = await getAchievements();

      const data = response.data;
      if (data) {
        setAchievements(data.achievements);
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
          authenticate(
            JSON.parse(JSON.stringify(tg.initDataUnsafe).replace(/'/g, '"'))
          );
        }
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
      <p>{JSON.stringify(userAchievements)}</p>
    </div>
  );
};

export default Home;
