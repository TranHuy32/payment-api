import { Injectable } from '@nestjs/common';
import { EntityRepository } from 'src/repository/entity.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bank, BankDocument } from '../schema/bank.schema';
import { CreateBankDto } from '../dto/create-bank.dto';

@Injectable()
export class BankRepository extends EntityRepository<BankDocument> {
  constructor(
    @InjectModel(Bank.name)
    private readonly bankModel: Model<BankDocument>,
  ) {
    super(bankModel);
  }

  async createBank(createBankDto: CreateBankDto): Promise<Bank> {
    const bank = new this.bankModel(createBankDto);
    return bank.save();
  }

}
