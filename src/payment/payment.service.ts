import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './repository/payment.repository';
import {
  ActionType,
  PaymentDocument,
  PaymentStatus,
  PaymentType,
} from './schema/payment.schema';
import PaymentError, { PaymentErrorCode } from './payment.error';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentDocument> {
    const MONEY_SHARE_CALCULATION = 1000;
    createPaymentDto.amount = createPaymentDto.amount / MONEY_SHARE_CALCULATION;
    createPaymentDto.lastBalance =
      createPaymentDto.lastBalance / MONEY_SHARE_CALCULATION;
    createPaymentDto.status = PaymentStatus.PENDING;
    createPaymentDto.createdAt = new Date().toLocaleString('en-GB', {
      hour12: false,
    });
    createPaymentDto.type = PaymentType.WITHDRAW;
    const newPayment = await this.paymentRepository.createObject(
      createPaymentDto,
    );
    return newPayment;
  }
}
