import {
  Controller
} from '@nestjs/common';
import BaseController from 'src/base.controller';
import { BankService } from './bank.service';

@Controller('bank')
export class BankController extends BaseController {
  constructor(private readonly bankService: BankService) {
    super();
  }
}
