import { TypeBank } from "../schema/payment.schema";

export class CreatePaymentDto {
  type_bank: TypeBank;
  content_bank: string;
}
