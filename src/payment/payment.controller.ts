import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import BaseController from 'src/base.controller';
import { CreatePaymentDto } from './dto/create-payment.dto';
import PaymentError, { PaymentErrorCode } from './payment.error';
import { PaymentDocument } from './schema/payment.schema';

@Controller('payment')
export class PaymentController extends BaseController {
  constructor(private readonly paymentService: PaymentService) {
    super();
  }
  @Post('/create')
  async createPayment(
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    // try {
    const result = await this.paymentService.createPayment(createPaymentDto);
    return result;
    //       if (result instanceof PaymentError) {
    //         throw result;
    //       }
    //       return this.data(result);
    //     } catch (error) {
    //       if (error instanceof PaymentError) return error;
    //   return this.fail(error);
    //     }
  }
}
