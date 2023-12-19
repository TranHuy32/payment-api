import BaseError from '../base.error';

export enum PaymentErrorCode {
  USER_NOT_FOUND = 101,
  MISSING_CUSTOMER_ACCOUNT_INFO = 102,
  MISSING_ADMIN_ACCOUNT_INFO = 103,
  PAYMENT_NOT_FOUND = 104,
  WRONG_OWNER = 105,
  OWNER_NOT_FOUND = 106,
  PAYMENT_NOT_PENDING = 107,
  WRONG_ACTION_TYPE = 108,
}

export const PaymentErrorMessage = {
  101: 'User not found',
  102: 'Missing customer account information',
  103: 'Missing admin account information',
  104: 'Payment not found',
  105: 'Wrong owner',
  106: 'Owner not found',
  107: 'Payment not pending',
  108: 'Wrong action type',
};

export default class PaymentError extends BaseError {
  code: PaymentErrorCode;

  constructor(code: PaymentErrorCode) {
    super(PaymentErrorMessage[code], 400);

    this.name = 'PaymentError';

    this.code = code;
  }
}
