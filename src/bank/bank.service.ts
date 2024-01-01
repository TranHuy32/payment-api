import { Injectable } from '@nestjs/common';
import { BankRepository } from './repository/bank.repository';
import { CreateBankDto } from './dto/create-bank.dto';
import { BankDocument } from './schema/bank.schema';

@Injectable()
export class BankService {
  constructor(private readonly bankRepository: BankRepository) { }

  async createBank(
    createBankDto: CreateBankDto,
  ): Promise<BankDocument | string> {
    const bank = await this.findBankByType(createBankDto.typeBank);
    if (bank) {
      return
    }
    createBankDto.createdAt = new Date().toLocaleString('en-GB', {
      hour12: false,
    });
    const a = await this.bankRepository.createObject(createBankDto);
    return a
  }

  async findBankByType(typeBank: string): Promise<BankDocument> {
    const token = await this.bankRepository.findOneObject({ typeBank });
    return token;
  }

}
