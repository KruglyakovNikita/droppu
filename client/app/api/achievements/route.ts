import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value ?? "why";
  console.log(accessToken);
  console.log(`Bearer ${accessToken}`);

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
      { message: errorData.message || "Registration failed", achievements: [] },
      { status: response.status }
    );
  }

  const data = await response.json();
  console.log(data);

  const nextResponse = NextResponse.json({
    achievements: data.achievements ?? [],
  });

  return nextResponse;
}
