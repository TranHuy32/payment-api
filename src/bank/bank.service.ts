import { Injectable } from '@nestjs/common';
import { BankRepository } from './repository/bank.repository';

@Injectable()
export class BankService {
  constructor(private readonly bankRepository: BankRepository) { }

}
