import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './repository/payment.repository';
import {
  Payment,
  PaymentDocument,
  PaymentStatus,
  PaymentType,
} from './schema/payment.schema';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { TypeBank } from 'src/bank/schema/bank.schema';
import { BankService } from 'src/bank/bank.service';
import { CreateBankDto } from 'src/bank/dto/create-bank.dto';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly bankService: BankService
  ) { }

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
        console.log(paymentDetails);

        if (!!!paymentDetails['PS'] || !!!paymentDetails['ND'] || !!!paymentDetails['SD']) {
          if (!!!paymentDetails['PS']) {
            console.log("[Create Payment Err] Thieu PS")
            return
          }
          if (!!!paymentDetails['SD']) {
            console.log("[Create Payment Err] Thieu SD");
            return
          }
          if (!!!paymentDetails['ND']) console.log("[Create Payment Err] Thieu ND");
        }

        let isAdd = true

        console.log(2222, !!paymentDetails['PS']?.includes('-'));
        if (!!paymentDetails['PS']?.includes('-')) {
          console.log(`[Create Payment Err] Tai khoan bi tru tien: ${paymentDetails['PS'].replaceAll(" ", "")}`);
          isAdd = false
        }
        if (!await this.validateUserName(paymentDetails['ND'].replaceAll(" ", ""))) {
          console.log(`[Create Payment Err] Sai noi dung chuyen khoan: ${paymentDetails['ND']}`);
          newPayment.isRightND = false
        } else {
          newPayment.userName = paymentDetails['ND'].replaceAll(" ", "")
          newPayment.isRightND = true
        }
        const SD = await this.transferAmount(paymentDetails['SD'])
        newPayment.amount = await this.transferAmount(paymentDetails['PS'])
        newPayment.ND = paymentDetails['ND']

        // update bank

        const bank = await this.bankService.findBankByType(TypeBank.TP_BANK)
        if (!!!bank) {
          const createBankDto = new CreateBankDto
          createBankDto.typeBank = TypeBank.TP_BANK
          createBankDto.lastBalance = SD
          await this.bankService.createBank(createBankDto)
        }
        if (!!bank) {
          if (isAdd) {
            if (bank.lastBalance + newPayment.amount === SD) {
              bank.lastBalance = await this.transferAmount(paymentDetails['SD'])
            } else {
              console.log("[Create Payment Err] Sai so du cuoi");
              return
            }
          }
          if (!isAdd) {
            if (bank.lastBalance - newPayment.amount === SD) {
              bank.lastBalance = await this.transferAmount(paymentDetails['SD'])
            } else {
              console.log("[Create Payment Err] Sai so du cuoi");
              return
            }
          }
          bank.updatedAt = new Date().toLocaleString('en-GB', {
            hour12: false,
          });
          await bank.save()
        }
        break;

      default:
        console.log('[Create Payment Err] Ngan hang khong duoc ho tro');
        return;
    }

    newPayment.status = PaymentStatus.PENDING;
    newPayment.createdAt = new Date().toLocaleString('en-GB', {
      hour12: false,
    });
    newPayment.type = PaymentType.DEPOSIT;
    const paymentCreated = await this.paymentRepository.createObject(
      newPayment
    );
    // console.log(`[Create Payment Info] Nap thanh công: ${paymentCreated.amount}k So du cuoi: ${bank.lastBalance}k`);
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
