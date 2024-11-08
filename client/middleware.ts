// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";
// import cookie from "cookie";

// export function middleware(req: NextRequest) {
//   const { pathname } = req.nextUrl;

//   // Пути, которые не требуют аутентификации
//   const publicPaths = [
//     "/*",
//     "/login",
//     "/register",
//     "/api/auth/login",
//     "/api/auth/register",
//     "/api/auth/telegram",
//   ];

//   return NextResponse.next();
//   if (publicPaths.includes(pathname)) {
//     //add here
//   }

//   const cookies = req.headers.get("cookie") || "";
//   const parsedCookies = cookie.parse(cookies);
//   const token: string = parsedCookies.token ?? "";

//   if (!token) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/login";
//     return NextResponse.redirect(url);
//   }

//   try {
//     jwt.verify(token, process.env.JWT_SECRET as string);
//     return NextResponse.next();
//   } catch (err) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/login";
//     return NextResponse.redirect(url);
//   }
// }

// export const config = {
//   matcher: ["/dashboard", "/api/user/:path*"],
// };
