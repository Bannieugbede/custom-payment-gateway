// src/app/api/set-token/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { idToken } = await req.json();

  if (!idToken) {
    return NextResponse.json({ error: "No ID token provided" }, { status: 400 });
  }

  // Set the cookie server-side
  const response = NextResponse.json({ message: "Token set successfully" });
  response.cookies.set("idToken", idToken, {
    httpOnly: true, // Secure, prevents client-side access
    secure: process.env.NODE_ENV === "production", // Use secure in production
    path: "/",
    maxAge: 3600, // 1 hour expiry
  });

  return response;
}