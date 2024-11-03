import { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

//Метод на получение данных о пользователе если обновили странциу
//и данные ещё есть, по сути такого быть не может так как с тг такое не прокатит
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method === "GET") {
    // Читаем куки из запроса
    const cookies = cookie.parse(req.headers.cookie || "");
    const authToken = cookies.authToken;

    if (!authToken) {
      res.status(401).json({ error: "Неавторизован" });
      return;
    }

    // Отправляем запрос на сервер для получения данных пользователя
    try {
      const response = await fetch("https://your-python-server.com/api/user", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        res.status(200).json(data);
      } else {
        res.status(response.status).json({
          error: data.error || "Не удалось получить данные пользователя",
        });
      }
    } catch (error) {
      console.error("Ошибка получения данных пользователя:", error);
      res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).json({ error: `Метод ${method} не разрешен` });
  }
}
