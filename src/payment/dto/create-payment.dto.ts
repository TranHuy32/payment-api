import { PaymentStatus, PaymentType } from "../schema/payment.schema";

export class CreatePaymentDto {
  userNumber: string;
  type: PaymentType;
  amount: number;
  status: PaymentStatus;
  createdAt: string;
  adminBankName: string;
  lastBalance: number;
}
