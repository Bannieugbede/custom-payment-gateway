// src/types/index.ts
export interface PaymentData {
  amount: number;
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
  role: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  reference?: string;
  transactionId?: string;
}