import { TypeBank } from "src/bank/schema/bank.schema";

export class CreatePaymentDto {
  type_bank: TypeBank;
  content_bank: string;
}
