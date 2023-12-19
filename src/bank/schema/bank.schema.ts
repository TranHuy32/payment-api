import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BankDocument = Bank & Document;

export enum TypeBank {
  TP_BANK = 1,
}

@Schema()
export class Bank {
  @Prop({
    enum: Object.values(TypeBank),
  })
  typeBank: number;
  @Prop({ required: true })
  lastBalance: number;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ default: null })
  updatedAt: string;
}
export const BankSchema = SchemaFactory.createForClass(Bank);
