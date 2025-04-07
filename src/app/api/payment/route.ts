/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/payment/route.ts
import { NextResponse } from "next/server";
import permit from "@/lib/permit";
import { createHmac } from "crypto";

// Define types for card details and transaction metadata
interface CardDetails {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

interface TransactionMetadata {
  email: string;
  name: string;
  role: string;
  amount: number;
}

interface Transaction {
  status: "success" | "failed";
  metadata: TransactionMetadata;
}

// Simulated transaction storage (in-memory for this example; use a DB in production)
const transactions: Record<string, Transaction> = {};

// Custom rate limiter
const rateLimitStore: Record<string, { count: number; lastReset: number }> = {};
const RATE_LIMIT_INTERVAL = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // Allow 10 requests per minute per IP

function customRateLimiter(req: Request): boolean {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const record = rateLimitStore[ip] || { count: 0, lastReset: now };

  if (now - record.lastReset > RATE_LIMIT_INTERVAL) {
    record.count = 0;
    record.lastReset = now;
  }

  record.count += 1;
  rateLimitStore[ip] = record;

  return record.count <= RATE_LIMIT_MAX_REQUESTS;
}

// Secure headers to mitigate common vulnerabilities
const securityHeaders = {
  "Content-Security-Policy": "default-src 'self'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};

// Helper function to tokenize payment data (simulates tokenization)
function tokenizePaymentData(cardDetails: CardDetails): string {
  const secret = process.env.PAYMENT_GATEWAY_SECRET;
  if (!secret) {
    throw new Error("Payment gateway secret not configured");
  }

  const data = JSON.stringify(cardDetails);
  const hmac = createHmac("sha256", secret);
  hmac.update(data);
  return hmac.digest("hex");
}

// Helper function to validate and sanitize input
function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .trim()
    .slice(0, 255); // Limit length to prevent abuse
}

// POST: Process payment form submission and simulate payment
export async function POST(req: Request) {
  if (!customRateLimiter(req)) {
    return NextResponse.json(
      { success: false, message: "Too many requests" },
      { status: 429, headers: securityHeaders }
    );
  }

  try {
    const { email, name, role, amount, cardDetails } = await req.json();

    // Validate and sanitize inputs
    if (!email || !name || !role || !amount || !cardDetails) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400, headers: securityHeaders }
      );
    }

    const sanitizedEmail = sanitizeInput(email);
    const sanitizedName = sanitizeInput(name);
    const sanitizedRole = sanitizeInput(role);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Invalid email format" },
        { status: 400, headers: securityHeaders }
      );
    }

    // Validate amount
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid amount" },
        { status: 400, headers: securityHeaders }
      );
    }

    // Validate card details
    const { cardNumber, expiry, cvv } = cardDetails as CardDetails;
    const cardNumberRegex = /^\d{16}$/;
    if (!cardNumberRegex.test(cardNumber)) {
      return NextResponse.json(
        { success: false, message: "Invalid card number" },
        { status: 400, headers: securityHeaders }
      );
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(expiry)) {
      return NextResponse.json(
        { success: false, message: "Invalid expiry date (MM/YY)" },
        { status: 400, headers: securityHeaders }
      );
    }

    const cvvRegex = /^\d{3}$/;
    if (!cvvRegex.test(cvv)) {
      return NextResponse.json(
        { success: false, message: "Invalid CVV" },
        { status: 400, headers: securityHeaders }
      );
    }

    // Tokenize payment data (simulates sending to a payment processor)
    const paymentToken = tokenizePaymentData({ cardNumber, expiry, cvv });

    // Simulate payment processing
    const reference = `txn_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const paymentSuccessful = Math.random() > 0.2; // 80% success rate for simulation

    transactions[reference] = {
      status: paymentSuccessful ? "success" : "failed",
      metadata: { email: sanitizedEmail, name: sanitizedName, role: sanitizedRole, amount: parsedAmount },
    };

    if (!paymentSuccessful) {
      return NextResponse.json(
        { success: false, message: "Payment simulation failed" },
        { status: 400, headers: securityHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Payment submitted successfully", reference },
      { headers: securityHeaders }
    );
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: securityHeaders }
    );
  }
}

// GET: Verify payment and update application state
export async function GET(req: Request) {
  if (!customRateLimiter(req)) {
    return NextResponse.json(
      { success: false, message: "Too many requests" },
      { status: 429, headers: securityHeaders }
    );
  }

  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json(
      { success: false, message: "Missing transaction reference" },
      { status: 400, headers: securityHeaders }
    );
  }

  try {
    const transaction = transactions[reference];
    if (!transaction) {
      return NextResponse.json(
        { success: false, message: "Transaction not found" },
        { status: 404, headers: securityHeaders }
      );
    }

    if (transaction.status !== "success") {
      return NextResponse.json(
        { success: false, message: "Transaction failed" },
        { status: 400, headers: securityHeaders }
      );
    }

    // Extract metadata and assign role in Permit.io (already implemented)
    const { email, name, role } = transaction.metadata;

    // Create user in Permit.io
    const permitUser = {
      key: email,
      email,
      first_name: name.split(" ")[0] || name,
      last_name: name.split(" ").slice(1).join(" ") || "",
      attributes: {},
    };

    try {
      await permit.api.createUser(permitUser);
      console.log(`Permit.io user created: ${email}`);
    } catch (error: any) {
      if (error.response?.status !== 409) {
        throw new Error(`Failed to create user in Permit.io: ${error.message}`);
      }
      console.log("User already exists in Permit.io, proceeding...");
    }

    // Assign role in Permit.io
    const assignedRole = {
      user: email,
      role: role || "customer",
      tenant: "default",
    };

    await permit.api.assignRole(assignedRole);
    console.log(`Permit.io role assigned: ${role} to ${email}`);

    return NextResponse.json(
      { success: true, message: "Payment verified successfully", transaction },
      { headers: securityHeaders }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: securityHeaders }
    );
  }
}