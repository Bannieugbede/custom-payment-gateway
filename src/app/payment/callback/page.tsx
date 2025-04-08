// src/app/payment/callback/page.tsx
import { Suspense } from "react";
import PaymentCallbackClient from "./PaymentCallbackClient";

export default function PaymentCallback() {
  return (
    <Suspense fallback={<p>Loading payment verification...</p>}>
      <PaymentCallbackClient />
    </Suspense>
  );
}