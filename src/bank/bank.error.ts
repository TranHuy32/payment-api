import BaseError from '../base.error';

export enum BankErrorCode {

}

export const BankErrorMessage = {

};

export default class PaymentError extends BaseError {
  code: BankErrorCode;

  constructor(code: BankErrorCode) {
    super(BankErrorMessage[code], 400);

    this.name = 'BankError';

    this.code = code;
  }
}
