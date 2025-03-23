/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/login/page.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import styles from "@/styles/login.module.css";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/auth", { userId });
      router.push("/payment");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className={styles.loginContainer}>
        <h2>Login</h2>
        <div className={styles.formGroup}>
          <label htmlFor="userId">User ID</label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter your user ID (e.g., user123)"
            required
          />
        </div>
        <button onClick={handleLogin} className={styles.loginButton} disabled={loading}>
          {loading ? "Logging in..." : "Log In as Customer"}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}