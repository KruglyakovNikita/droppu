import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    console.log(request.cookies.getAll());

    return NextResponse.json(
      { message: "Access token is missing" },
      { status: 401 }
    );
  }

  const response = await fetch(
    `${process.env.PYTHON_BACKEND_URL}/api/v1/achievements/`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
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

  // Устанавливаем HTTP-only cookie с токеном
  const nextResponse = NextResponse.json({
    achievements: data.achievements,
  });

  return nextResponse;
}
//Ешё будет PUT для обновления
