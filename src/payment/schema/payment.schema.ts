import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}
export enum PaymentType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
}

export enum ActionType {
  CANCEL = "CANCEL",
  ACCEPT = "ACCEPT"
}

@Schema()
export class Payment {
  @Prop({ required: false })
  userName: string;
  @Prop({ default: null })
  owner_id: string;
  @Prop({
    enum: Object.values(PaymentType),
    required: true,
  })
  type: PaymentType;
  @Prop({ required: true })
  amount: number;
  @Prop({
    enum: Object.values(PaymentStatus),
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;
  // @Prop({ required: null })
  // customerBankContent: string;
  // @Prop({ default: null })
  // customerBankName: string;
  // @Prop({ default: null })
  // customerBankAccountNumber: string;
  @Prop({ default: null })
  groupId: string;
  @Prop({ default: null })
  ND: string;
  @Prop({ default: true })
  isRightND: boolean;
  @Prop({ default: null })
  completedAt: string;
  @Prop({ default: null })
  canceledAt: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ default: null })
  deletedAt: string;
}
export const PaymentSchema = SchemaFactory.createForClass(Payment);
