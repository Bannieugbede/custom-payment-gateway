/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, FormEvent } from "react";
import axios from "axios";
import { PaymentData, PaymentResponse } from "@/types";
import { auth } from "@/lib/firebase";
import styles from "@/styles/payment.module.css";

export default function PaymentForm() {
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: "",
  });
  const [response, setResponse] = useState<PaymentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "cardNumber") {
      // Format card number with spaces every 4 digits
      const cleaned = value.replace(/\D/g, "").slice(0, 16);
      const formatted = cleaned.replace(/(\d{4})/g, "$1 ").trim();
      setPaymentData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "expiry") {
      // Format expiry as MM/YY
      const cleaned = value.replace(/\D/g, "").slice(0, 4);
      const formatted =
        cleaned.length > 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}` : cleaned;
      setPaymentData((prev) => ({ ...prev, [name]: formatted }));
    } else if (name === "cvv") {
      // Limit CVV to 3 digits
      const cleaned = value.replace(/\D/g, "").slice(0, 3);
      setPaymentData((prev) => ({ ...prev, [name]: cleaned }));
    } else {
      setPaymentData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post<PaymentResponse>("/api/payment", {
        ...paymentData,
        cardNumber: paymentData.cardNumber.replace(/\s/g, ""), // Remove spaces for backend
      });
      setResponse(res.data);
    } catch (error: any) {
      console.error("Payment submission error:", error);
      setResponse({ success: false, message: `Network error: ${error.message}` });
    } finally {
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
            <label htmlFor="amount" className={styles.label}>
              Amount ($)
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
            />
          </div>

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
              maxLength={19} // 16 digits + 3 spaces
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
            {response.transactionId && (
              <p>Transaction ID: {response.transactionId}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}