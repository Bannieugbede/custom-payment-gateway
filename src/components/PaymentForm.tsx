/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import styles from "./PaymentForm.module.css"; // Use CSS module instead of global styles

interface PaymentData {
  amount: number;
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
  role: string;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  reference?: string;
  transactionId?: string;
}

export default function PaymentForm() {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
    role: "customer",
  });
  const [response, setResponse] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  const PAYMENT_FEE = 45; // $45 fee

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      const cleaned = value.replace(/\D/g, "").slice(0, 16);
      const formatted = cleaned.replace(/(\d{4})/g, "$1 ").trim();
      setPaymentData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "expiry") {
      const cleaned = value.replace(/\D/g, "").slice(0, 4);
      const formatted =
        cleaned.length > 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}` : cleaned;
      setPaymentData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "cvv") {
      const cleaned = value.replace(/\D/g, "").slice(0, 3);
      setPaymentData((prev) => ({ ...prev, [name]: cleaned }));
    } else if (name === "amount") {
      const parsedValue = parseFloat(value);
      setPaymentData((prev) => ({ ...prev, [name]: isNaN(parsedValue) ? 0 : parsedValue }));
    } else {
      setPaymentData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResponse(null);
    setLoading(true);

    // Client-side validation
    if (!userEmail) {
      setResponse({ success: false, message: "User not authenticated. Please log in." });
      setLoading(false);
      return;
    }

    if (paymentData.amount <= 0) {
      setResponse({ success: false, message: "Amount must be greater than 0" });
      setLoading(false);
      return;
    }

    const cardNumberRegex = /^\d{16}$/;
    if (!cardNumberRegex.test(paymentData.cardNumber.replace(/\s/g, ""))) {
      setResponse({ success: false, message: "Invalid card number (must be 16 digits)" });
      setLoading(false);
      return;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryRegex.test(paymentData.expiry)) {
      setResponse({ success: false, message: "Invalid expiry date (MM/YY)" });
      setLoading(false);
      return;
    }

    const cvvRegex = /^\d{3}$/;
    if (!cvvRegex.test(paymentData.cvv)) {
      setResponse({ success: false, message: "Invalid CVV (must be 3 digits)" });
      setLoading(false);
      return;
    }

    if (!paymentData.name.trim()) {
      setResponse({ success: false, message: "Cardholder name is required" });
      setLoading(false);
      return;
    }

    try {
      const totalAmount = paymentData.amount + PAYMENT_FEE;
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          name: paymentData.name,
          role: paymentData.role,
          amount: totalAmount,
          cardDetails: {
            cardNumber: paymentData.cardNumber.replace(/\s/g, ""),
            expiry: paymentData.expiry,
            cvv: paymentData.cvv,
          },
        }),
      });

      const data: PaymentResponse = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to process payment");
      }

      setResponse({ success: true, message: "Payment submitted successfully", reference: data.reference });
      router.push(`/payment/callback?reference=${data.reference}`);
    } catch (error: any) {
      console.error("Payment submission error:", error);
      setResponse({ success: false, message: `Error: ${error.message}` });
      setLoading(false);
    }
  };

  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentBox}>
        <h2 className={styles.title}>Make a Payment</h2>
        {userEmail ? (
          <p className={styles.userEmail}>
            Logged in as: <span>{userEmail}</span>
          </p>
        ) : (
          <p className={styles.userEmail}>Not logged in</p>
        )}

        <form onSubmit={handleSubmit} className={styles.paymentForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.label}>
              Cardholder Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={paymentData.name}
              onChange={handleChange}
              className={styles.input}
              placeholder="John Doe"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.label}>
              Role
            </label>
            <select
              id="role"
              name="role"
              value={paymentData.role}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="amount" className={styles.label}>
              Amount (USD)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={paymentData.amount || ""}
              onChange={handleChange}
              className={styles.input}
              placeholder="Enter amount"
              required
              min="1"
              step="0.01"
            />
          </div>

          <div className={styles.formGroup}>
            <p className="text-sm text-gray-600">
              Payment Fee: <span className="font-medium">${PAYMENT_FEE}</span>
            </p>
            {paymentData.amount > 0 && (
              <p className="text-sm text-gray-600">
                Total Amount: <span className="font-medium">${(paymentData.amount + PAYMENT_FEE).toFixed(2)}</span>
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cardNumber" className={styles.label}>
              Card Number
            </label>
            <input
              type="text"
              id="cardNumber"
              name="cardNumber"
              value={paymentData.cardNumber}
              onChange={handleChange}
              className={styles.input}
              placeholder="1234 5678 9012 3456"
              required
              maxLength={19}
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="expiry" className={styles.label}>
                Expiry (MM/YY)
              </label>
              <input
                type="text"
                id="expiry"
                name="expiry"
                value={paymentData.expiry}
                onChange={handleChange}
                className={styles.input}
                placeholder="MM/YY"
                required
                maxLength={5}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="cvv" className={styles.label}>
                CVV
              </label>
              <input
                type="text"
                id="cvv"
                name="cvv"
                value={paymentData.cvv}
                onChange={handleChange}
                className={styles.input}
                placeholder="123"
                required
                maxLength={3}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.payButton} ${loading ? styles.disabled : ""}`}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </form>

        {response && (
          <div
            className={`${styles.response} ${
              response.success ? styles.success : styles.error
            }`}
          >
            <p>{response.message}</p>
            {response.reference && (
              <p>Reference: {response.reference}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}