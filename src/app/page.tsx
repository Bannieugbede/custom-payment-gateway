// src/app/page.tsx
import LoginPage from "./login/page";
// import SignupPage from "./signup/page";
import PaymentForm from "@/components/PaymentForm";
import permit from "@/lib/permit";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Force dynamic rendering due to cookies usage
export const dynamic = "force-dynamic";

// Retry utility for network requests
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry ${i + 1}/${retries} failed:`, error);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Unreachable");
}

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

export default async function PaymentPage() {
  let userId: string | null = null;
  let hasAccess = false;

  // Step 1: Verify user with Firebase
  try {
    const cookieStore = cookies();
    const idToken = cookieStore.get("idToken")?.value;

    if (idToken) {
      const auth = getAuth();
      userId = await withRetry(async () => {
        const decodedToken = await auth.verifyIdToken(idToken);
        return decodedToken.email || null;
      });
      console.log("Firebase user verified:", userId);
    } else {
      console.log("No idToken cookie found");
    }
  } catch (error) {
    console.error("Firebase authentication error:", error);
    userId = null;
  }

  // Step 2: Check permissions with Permit.io if user is authenticated
  if (userId) {
    try {
      hasAccess = await withRetry(() =>
        permit.check(userId!, "pay", "payment")
      );
      console.log("Permit.io access check:", hasAccess);
    } catch (error) {
      console.error("Permit.io check failed:", error);
      hasAccess = false;
    }
  }

  // Step 3: Render based on auth and permission status
  if (!userId) {
    return (
      <div style={{ minHeight: "100vh", padding: "2rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.75rem", marginBottom: "1.5rem" }}>
          Payment Gateway
        </h1>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          Please log in or sign up to continue
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <LoginPage />
          {/* <span style={{ color: "#666" }}>OR</span>
          <SignupPage /> */}
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div style={{ minHeight: "100vh", padding: "4rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.75rem", color: "#333" }}>Unauthorized</h1>
        <p style={{ color: "#dc3545", marginTop: "1rem" }}>
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "2rem" }}>
      <h1 style={{ textAlign: "center", fontSize: "1.75rem", marginBottom: "1.5rem" }}>
        Payment Gateway
      </h1>
      <PaymentForm />
    </div>
  );
}