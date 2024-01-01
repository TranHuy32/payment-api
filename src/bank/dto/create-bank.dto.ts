import { TypeBank } from "../schema/bank.schema";

export class CreateBankDto {
  typeBank: TypeBank;
  lastBalance: number;
  createdAt: string
}
