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
import axios from 'axios';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly bankService: BankService,
  ) {}

  async createPayment(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentDocument | boolean> {
    let paymentResultId = '';
    const newPayment = new Payment();
    const paymentDetails: any = {};
    const decodedContentBank = decodeURIComponent(
      createPaymentDto.content_bank,
    );
    newPayment.status = PaymentStatus.PENDING;
    newPayment.createdAt = new Date().toLocaleString('en-GB', {
      hour12: false,
    });
    newPayment.type = PaymentType.DEPOSIT;

    //TP_BANK
    if (createPaymentDto.type_bank === TypeBank.TP_BANK) {
      const contentBankArray = decodedContentBank.split('\n');
      contentBankArray.forEach((detail) => {
        const [key, value] = detail.split(':');
        paymentDetails[key] = value;
      });

      if (
        !!!paymentDetails['PS'] ||
        !!!paymentDetails['ND'] ||
        !!!paymentDetails['SD']
      ) {
        if (!!!paymentDetails['PS']) {
          console.log('[Create Payment Err] Thieu PS');
          return;
        }
        if (!!!paymentDetails['SD']) {
          console.log('[Create Payment Err] Thieu SD');
          return;
        }
        if (!!!paymentDetails['ND'])
          console.log('[Create Payment Err] Thieu ND');
      }

      let isAdd = true;

      if (!!paymentDetails['PS']?.includes('-')) {
        console.log(
          `[Create Payment Err] Tai khoan bi tru tien: ${paymentDetails[
            'PS'
          ].replaceAll(' ', '')}`,
        );
        isAdd = false;
        newPayment.depositIsAdd = false;
      }
      if (
        !(await this.validateUserName(
          paymentDetails['ND']?.replaceAll(' ', ''),
        ))
      ) {
        console.log(
          `[Create Payment Err] Sai noi dung chuyen khoan: ${paymentDetails['ND']}`,
        );
        newPayment.isRightND = false;
        newPayment.status = PaymentStatus.WRONG_ND;
      } else {
        newPayment.userName = paymentDetails['ND'].replaceAll(' ', '');
        newPayment.isRightND = true;
        newPayment.status = PaymentStatus.PENDING;
      }
      const SD = await this.transferAmount(paymentDetails['SD']);
      newPayment.amount = await this.transferAmount(paymentDetails['PS']);
      newPayment.ND = !!paymentDetails['ND'] ? paymentDetails['ND'] : '';
      newPayment.depositBankType = TypeBank.TP_BANK;
      newPayment.SD = SD;
      const paymentCreated = await this.paymentRepository.createObject(
        newPayment,
      );

      if (!!newPayment.isRightND && !!newPayment.userName) {
        const URL = process.env.APP_BE_URL || '';
        let user: any;
        let isChange = false;
        await axios
          .get(`${URL}/users/detailForDeposit/${newPayment.userName}`)
          .then((response) => {
            user = response.data;
            paymentCreated.groupId = user.groupId;
            paymentCreated.user_id = user._id;
            isChange = true;
          })
          .catch((error) => {
            paymentCreated.status = PaymentStatus.WRONG_ND;
            paymentCreated.isRightND = false;
            isChange = true;
            console.error('[Axios Error]', error.message);
          });
        if (!!isChange) {
          await paymentCreated.save();
        }
      }

      // update bank
      const bank = await this.bankService.findBankByType(TypeBank.TP_BANK);
      if (!!!bank) {
        const createBankDto = new CreateBankDto();
        createBankDto.typeBank = TypeBank.TP_BANK;
        createBankDto.lastBalance = SD;
        await this.bankService.createBank(createBankDto);
        console.log('[Create Bank Success] tao bank thanh cong');
      }
      if (!!bank) {
        if (isAdd) {
          if (bank.lastBalance + newPayment.amount === SD) {
            bank.lastBalance = SD;
            bank.updatedAt = new Date().toLocaleString('en-GB', {
              hour12: false,
            });
            await bank.save();
            console.log('[Upadate Bank Success] update so du thanh cong');
          } else {
            console.log('[Create Payment Err] Sai so du cuoi');
            paymentCreated.status = PaymentStatus.WRONG_DEPOSIT_INFO;
            await paymentCreated.save();
          }
        }
        if (!isAdd) {
          if (bank.lastBalance - newPayment.amount === SD) {
            bank.lastBalance = SD;
            paymentCreated.status = PaymentStatus.WRONG_DEPOSIT_INFO;
            paymentCreated.depositIsAdd = false;
            await paymentCreated.save();
            bank.updatedAt = new Date().toLocaleString('en-GB', {
              hour12: false,
            });
            await bank.save();
            console.log('[Upadate Bank Success] update so du thanh cong');
          } else {
            console.log('[Create Payment Err] Sai so du cuoi');
            paymentCreated.status = PaymentStatus.WRONG_DEPOSIT_INFO;
            await paymentCreated.save();
          }
        }
      }
      paymentResultId = !!paymentCreated._id ? paymentCreated._id : '';
    }

    // console.log(`[Create Payment Info] Nap thanh công: ${paymentCreated.amount}k So du cuoi: ${bank.lastBalance}k`);
    return !!paymentResultId
      ? await this.paymentRepository.findOneObject({ _id: paymentResultId })
      : false;
  }

  async validateUserName(userName: string): Promise<boolean> {
    const userNameRegex = /^\d{10}$/;
    return userNameRegex.test(userName);
  }

  async transferAmount(amount: string): Promise<number> {
    const MONEY_SHARE_CALCULATION = 1000;
    const cleanedAmount = amount.replace(/\D/g, '');
    const result = parseFloat(cleanedAmount) / MONEY_SHARE_CALCULATION;
    return result;
  }
}
