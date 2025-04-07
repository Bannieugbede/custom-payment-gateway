/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/payment/callback/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import styles from "@/components/PaymentForm.module.css";

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

interface PaymentResponse {
  success: boolean;
  message: string;
  transaction?: Transaction;
}

export default function PaymentCallback() {
  const searchParams = useSearchParams();
  const reference = searchParams?.get("reference");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("Missing transaction reference");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payment?reference=${reference}`);
        const data: PaymentResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to verify payment");
        }

        if (!data.transaction) {
          setStatus("failed");
          setMessage("Transaction details not found");
          return;
        }

        setStatus("success");
        setMessage("Payment successful!");
        setTransaction(data.transaction);
      } catch (err) {
        setStatus("failed");
        setMessage("Payment verification failed");
      }
    };

    verifyPayment();
  }, [reference]);

  const handleReturnToLogin = () => {
    router.push("/login");
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className={styles.paymentContainer}>
      <div className={styles.paymentBox}>
        {/* <h1 className={styles.title}>Payment Status</h1> */}
        {status === "loading" && (
          <p className={styles.response}>Verifying your payment, please wait...</p>
        )}
        {status === "failed" && (
          <p className={`${styles.response} ${styles.error}`}>{message}</p>
        )}
        {status === "success" && transaction && (
          <div className={styles.receipt}>
            <h2 className={styles.title}>Payment Receipt</h2>
            <div className={styles.receiptDetails}>
              <p className={styles.receiptItem}>
                <span className={styles.receiptLabel}>Status:</span>
                <span className={styles.receiptValue}>Successful</span>
              </p>
              <p className={styles.receiptItem}>
                <span className={styles.receiptLabel}>Email:</span>
                <span className={styles.receiptValue}>{transaction.metadata.email}</span>
              </p>
              <p className={styles.receiptItem}>
                <span className={styles.receiptLabel}>Cardholder Name:</span>
                <span className={styles.receiptValue}>{transaction.metadata.name}</span>
              </p>
              <p className={styles.receiptItem}>
                <span className={styles.receiptLabel}>Total Amount:</span>
                <span className={styles.receiptValue}>${transaction.metadata.amount.toFixed(2)}</span>
              </p>
              <p className={styles.receiptItem}>
                <span className={styles.receiptLabel}>Reference Number:</span>
                <span className={styles.receiptValue}>{reference}</span>
              </p>
            </div>
            <p className={`${styles.response} ${styles.success}`}>{message}</p>
            <div className={styles.buttonGroup}>
              <button
                onClick={handlePrintReceipt}
                className={styles.printButton}
              >
                Print Receipt
              </button>
              <button
                onClick={handleReturnToLogin}
                className={styles.returnButton}
              >
                Return to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}