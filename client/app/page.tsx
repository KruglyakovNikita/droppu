"use client";

import { useEffect } from "react";
import { useStore } from "./lib/store/store";
import dynamic from "next/dynamic";

// Динамический импорт компонента Game с отключением SSR
const Game = dynamic(() => import("./game/Game"), { ssr: false });

const Home = () => {
  const setUser = useStore((state) => state.setUser);
  const setTokens = useStore((state) => state.setTokens);
  const setTickets = useStore((state) => state.setTickets);
  const setInventory = useStore((state) => state.setInventory);
  const setAchievements = useStore((state) => state.setAchievements);
  const setInvitedUsers = useStore((state) => state.setInvitedUsers);
  const setTotalTokensFromInvited = useStore(
    (state) => state.setTotalTokensFromInvited
  );

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
        setUser(data.user);
        setTokens(data.tokens);
        setTickets(data.tickets);
        setInventory(data.inventory);
        setAchievements(data.achievements);
        setInvitedUsers(data.invitedUsers);
        setTotalTokensFromInvited(data.totalTokensFromInvited);
      } else {
        console.error("Ошибка регистрации:", data.message);
      }
    } catch (error) {
      console.error("Ошибка запроса:", error);
    }
  };

  useEffect(() => {
    authenticate();
  }, []);

  return (
    <div>
      <h1>asdasd</h1>
      {/* <Game /> */}
    </div>
  );
};

export default Home;
