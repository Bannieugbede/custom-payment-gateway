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
  const { idToken, role, email, name } = await req.json();

  if (!idToken || !role || !email || !name) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // Step 1: Verify Firebase token
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    if (decodedToken.email !== email) {
      return NextResponse.json({ error: "Email mismatch" }, { status: 401 });
    }

    // Step 2: Create user in Permit.io
    const permitUser = {
      key: email, // Use email as unique key since no DB ID
      email,
      first_name: name.split(" ")[0] || name,
      last_name: name.split(" ").slice(1).join(" ") || "",
      attributes: {},
    };

    try {
      await permit.api.createUser(permitUser);
    } catch (error) {
      if (error !== 409) { // 409 means user exists, proceed
        throw new Error(`Failed to create user in Permit.io: ${error}`);
      }
      console.log("User already exists in Permit.io, proceeding...");
    }

    // Step 3: Assign role in Permit.io
    const assignedRole = {
      user: email,
      role: role || "customer", // Default to "customer"
      tenant: "default",
    };

    await permit.api.assignRole(assignedRole);

    // Step 4: Set cookie and respond
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
      { error: `Signup failed: ${error || "Unknown error"}` },
      { status: 500 }
    );
  }
}