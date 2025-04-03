export interface PaymentData {
  amount: number;
  cardNumber: string;
  expiry: string;
  cvv: string;
  name: string;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  transactionId?: string;
}