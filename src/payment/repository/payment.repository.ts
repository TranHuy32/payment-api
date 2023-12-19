import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'src/repository/entity.repository';
import { Payment, PaymentDocument } from '../schema/payment.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreatePaymentDto } from '../dto/create-payment.dto';

@Injectable()
export class PaymentRepository extends EntityRepository<PaymentDocument> {
  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<PaymentDocument>,
  ) {
    super(paymentModel);
  }
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = new this.paymentModel(createPaymentDto);
    return payment.save();
  }
}
