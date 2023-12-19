import { TypeBank } from "../schema/bank.schema";

export class CreateBankDto {
  typeBank: TypeBank;
  lastChange: number;
  createdAt: string
}
