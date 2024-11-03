// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import cookie from "cookie";

export async function POST(request: NextRequest) {
  console.log("ONE");

  const { username, password } = await request.json();

  // Пример запроса на Python сервер
  //   const response = await fetch(
  //     `${process.env.PYTHON_BACKEND_URL}/auth/register`,
  //     {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ username, password }),
  //     }
  //   );

  //Это пример запроса с NextApi server
  const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "exampleUser", password: "examplePass" }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(
      { message: errorData.message || "Registration failed" },
      { status: response.status }
    );
  }

  const data = await response.json();

  // Устанавливаем HTTP-only cookie с токеном
  const nextResponse = NextResponse.json({
    user: data.user,
    tokens: data.tokens,
    tickets: data.tickets,
    inventory: data.inventory,
    achievements: data.achievements,
    invitedUsers: data.invitedUsers,
    totalTokensFromInvited: data.totalTokensFromInvited,
  });

  nextResponse.cookies.set("token", data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    maxAge: 60 * 60 * 24 * 7, // 1 неделя
    sameSite: "strict",
    path: "/",
  });

  return nextResponse;
}
