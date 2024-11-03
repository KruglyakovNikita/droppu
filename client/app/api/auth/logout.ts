import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";
import { useStore } from "@/app/lib/store/store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  const setUser = useStore((state) => state.setUser);
  const setTokens = useStore((state) => state.setTokens);
  const setTickets = useStore((state) => state.setTickets);
  const setInventory = useStore((state) => state.setInventory);
  const setAchievements = useStore((state) => state.setAchievements);
  const setInvitedUsers = useStore((state) => state.setInvitedUsers);
  const setTotalTokensFromInvited = useStore(
    (state) => state.setTotalTokensFromInvited
  );
  // Удаляем токен, устанавливая cookie с прошедшим временем
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      expires: new Date(0),
      sameSite: "strict",
      path: "/",
    })
  );
  setUser(null);
  setTokens(0);
  setTickets(0);
  setInventory([]);
  setAchievements([]);
  setInvitedUsers([]);
  setTotalTokensFromInvited(0);

  return res.status(200).json({ message: "Logout successful" });
}
