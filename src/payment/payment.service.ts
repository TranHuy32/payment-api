import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './repository/payment.repository';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
  PaymentType,
} from './schema/payment.schema';
import PaymentError, { PaymentErrorCode } from './payment.error';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { TypeBank } from 'src/bank/schema/bank.schema';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) { }

  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentDocument> {

    const newPayment = new Payment
    const paymentDetails: any = {};
    const decodedContentBank = decodeURIComponent(createPaymentDto.content_bank);

    switch (createPaymentDto.type_bank) {
      case TypeBank.TP_BANK:
        const contentBankArray = decodedContentBank.split("\n")
        contentBankArray.forEach((detail) => {
          const [key, value] = detail.split(":")
          paymentDetails[key] = value
        })

        if (!!!paymentDetails['PS'] || !!!paymentDetails['ND'] || !!!paymentDetails['SD']) {
          if (!!!paymentDetails['PS']) console.log("[Create Payment Err] Thieu PS");
          if (!!!paymentDetails['ND']) console.log("[Create Payment Err] Thieu ND");
          if (!!!paymentDetails['SD']) console.log("[Create Payment Err] Thieu SD");
          return
        }

        if (!!paymentDetails['ND'] && !await this.validateUserName(paymentDetails['ND'].replaceAll(" ", ""))) {
          console.log(`[Create Payment Err] Sai noi dung chuyen khoan: ${paymentDetails['ND']}`);
          return
        }

        if (!!paymentDetails['PS']?.includes('-')) {
          console.log(`[Create Payment Err] Tai khoan bi tru tien: ${paymentDetails['PS'].replaceAll(" ", "")}`);
          return
        }

        newPayment.amount = await this.transferAmount(paymentDetails['PS'])
        newPayment.lastBalance = await this.transferAmount(paymentDetails['SD'])
        newPayment.userName = paymentDetails['ND'].replaceAll(" ", "")
        break;

      default:
        console.log('[Create Payment Err] Ngan hang khong duoc ho tro');
        return;
    }

    newPayment.status = PaymentStatus.PENDING;
    newPayment.createdAt = new Date().toLocaleString('en-GB', {
      hour12: false,
    });
    newPayment.type = PaymentType.WITHDRAW;
    const paymentCreated = await this.paymentRepository.createObject(
      newPayment
    );
    console.log(`[Create Payment Info] Nap thanh công: ${paymentCreated.amount}k So du cuoi: ${paymentCreated.lastBalance}k`);
    return paymentCreated;
  }

  async validateUserName(userName: string): Promise<boolean> {
    const userNameRegex = /^\d{10}$/;
    return userNameRegex.test(userName);
  }

  async transferAmount(amount: string): Promise<number> {
    const MONEY_SHARE_CALCULATION = 1000;
    const cleanedAmount = amount.replace(/\D/g, '');
    const result = parseFloat(cleanedAmount) / 1000;
    return result;
  }
}
