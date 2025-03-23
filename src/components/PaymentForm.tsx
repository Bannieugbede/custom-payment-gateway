/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/PaymentForm.tsx
"use client";

import { useState, FormEvent } from "react";
import axios from "axios";
import { PaymentData, PaymentResponse } from "@/types";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await axios.post<PaymentResponse>("/api/payment", paymentData);
      setResponse(res.data);
    } catch (error: any) {
      console.error("Payment submission error:", error);
      setResponse({ success: false, message: `Network error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.paymentFormContainer}>
      <h2>Make a Payment</h2>
      <form onSubmit={handleSubmit} className={styles.paymentForm}>
        <div className={styles.formGroup}>
          <label htmlFor="amount">Amount ($)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={paymentData.amount}
            onChange={handleChange}
            required
            placeholder="Enter amount"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="name">Cardholder Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={paymentData.name}
            onChange={handleChange}
            required
            placeholder="John Doe"
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="cardNumber">Card Number</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={paymentData.cardNumber}
            onChange={handleChange}
            required
            placeholder="1234 5678 9012 3456"
          />
        </div>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="expiry">Expiry (MM/YY)</label>
            <input
              type="text"
              id="expiry"
              name="expiry"
              value={paymentData.expiry}
              onChange={handleChange}
              required
              placeholder="MM/YY"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="cvv">CVV</label>
            <input
              type="text"
              id="cvv"
              name="cvv"
              value={paymentData.cvv}
              onChange={handleChange}
              required
              placeholder="123"
            />
          </div>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Pay Now"}
        </button>
      </form>
      {response && (
        <div className={`${styles.response} ${response.success ? styles.success : styles.error}`}>
          <p>{response.message}</p>
          {response.transactionId && <p>Transaction ID: {response.transactionId}</p>}
        </div>
      )}
    </div>
  );
}