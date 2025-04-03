// src/app/payment/page.tsx
import PaymentForm from "@/components/PaymentForm";
import permit from "@/lib/permit";
// import Navbar from "@/components/Navbar";
import { getAuth } from "firebase-admin/auth";
import { cookies } from "next/headers"; // For accessing cookies in Next.js server components
import { initializeApp, getApps, cert } from "firebase-admin/app";

// Initialize Firebase Admin SDK (only once)
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

export const dynamic = "force-dynamic";
export default async function PaymentPage() {
  let userId: string | null = null;

  try {
    // Get the ID token from cookies (set by the client after login)
    const cookieStore = cookies();
    const idToken = cookieStore.get("idToken")?.value;

    if (!idToken) {
      throw new Error("No ID token found. Please log in.");
    }

    // Verify the ID token with Firebase Admin SDK
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    userId = decodedToken.email || null; // Use email as userId
  } catch (error) {
    console.error("Authentication error:", error);
    userId = null; // Fallback if verification fails
  }

  // Check if the user has permission to access the payment page
  const hasAccess = userId
    ? await permit.check(userId, "pay", "payment")
    : false;
  console.log(hasAccess, "access");

  if (!hasAccess) {
    return (
      <div>
        {/* <Navbar /> */}
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <h1>Unauthorized</h1>
          <p>You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* <Navbar /> */}
      <div style={{ padding: "2rem" }}>
        <h1 style={{ textAlign: "center" }}>Payment Gateway</h1>
        <PaymentForm />
      </div>
    </div>
  );
}