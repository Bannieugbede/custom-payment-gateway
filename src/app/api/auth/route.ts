// src/app/api/auth/route.ts
import { NextResponse } from "next/server";
import permit from "@/lib/permit";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Mock user authentication (in a real app, use a proper auth provider)
    const user = { id: userId, email: `${userId}@example.com` };

    // Assign the "customer" role to the user in Permit.io
    console.log(`Assigning role 'customer' to user: ${userId}`);
    await permit.assignRole(userId, "customer", "default");
    console.log(`Role assigned successfully to user: ${userId}`);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}