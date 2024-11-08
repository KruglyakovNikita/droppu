import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-static";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const response = await fetch(
    `${process.env.PYTHON_BACKEND_URL}/api/v1/users/init/`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    return NextResponse.json(
      { message: errorData.message || "Registration failed" },
      { status: response.status }
    );
  }

  const data = await response.json();
  console.log(data);

  const nextResponse = NextResponse.json({
    user: data.user,
    accessToken: data.accessToken,
  });

  nextResponse.cookies.set("accessToken", data.accessToken, {
    httpOnly: true,
    // secure: process.env.NODE_ENV !== "development",
    secure: true, // Убедитесь, что используется только в production с HTTPS
    maxAge: 60 * 60 * 12,
    sameSite: "strict",
    path: "/",
  });

  return nextResponse;
}
