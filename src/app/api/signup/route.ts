// src/app/api/signup/route.ts
import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import permit from "@/lib/permit";

// Initialize Firebase Admin SDK
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
};

if (!getApps().length) {
  initializeApp(firebaseAdminConfig);
}

export async function POST(req: Request) {
  const { idToken, role, email,} = await req.json();

  if (!idToken || !role || !email) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // Step 1: Verify ID token with Firebase
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    if (decodedToken.email !== email) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 401 });
    }

    // Step 2: Assign role in Permit.io
    await permit.api.assignRole({
      user: email, // Use email as user identifier
      role: role,  // e.g., "customer" or "admin"
      tenant: "default", // Adjust based on your Permit.io setup
    });

    // Step 3: Set the cookie
    const response = NextResponse.json({ message: "Signup successful" });
    response.cookies.set("idToken", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 3600,
    });

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Signup failed: " + (error || "Unknown error") },
      { status: 500 }
    );
  }
}