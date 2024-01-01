import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BankDocument = Bank & Document;

export enum TypeBank {
  TP_BANK = "TP_BANK"
}

@Schema()
export class Bank {
  @Prop({
    enum: Object.values(TypeBank),
    required: true,
  })
  typeBank: TypeBank;
  @Prop({ required: true })
  lastBalance: number;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ default: null })
  updatedAt: string;
}
export const BankSchema = SchemaFactory.createForClass(Bank);
