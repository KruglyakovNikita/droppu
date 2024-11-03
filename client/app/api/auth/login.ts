import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";
import { useStore } from "@/app/lib/store/store";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password } = req.body;
  // Получаем методы для обновления состояния
  const setUser = useStore((state) => state.setUser);
  const setTokens = useStore((state) => state.setTokens);
  const setTickets = useStore((state) => state.setTickets);
  const setInventory = useStore((state) => state.setInventory);
  const setAchievements = useStore((state) => state.setAchievements);
  const setInvitedUsers = useStore((state) => state.setInvitedUsers);
  const setTotalTokensFromInvited = useStore(
    (state) => state.setTotalTokensFromInvited
  );
  try {
    // Отправляем запрос на Python сервер для логина
    const response = await fetch(
      `${process.env.PYTHON_BACKEND_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ message: data.message || "Login failed" });
    }

    // Устанавливаем токен в HTTP-only cookie
    res.setHeader(
      "Set-Cookie",
      cookie.serialize("token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        maxAge: 60 * 60 * 24 * 7, // 1 неделя
        sameSite: "strict",
        path: "/",
      })
    );
    setUser(data.user);
    setTokens(data.tokens);
    setTickets(data.tickets);
    setInventory(data.inventory);
    setAchievements(data.achievements);
    setInvitedUsers(data.invitedUsers);
    setTotalTokensFromInvited(data.totalTokensFromInvited);
    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
