'use strict'

const commercetoolsPaymentStates = {
  BALANCE_DUE: 'BalanceDue',
  FAILED: 'Failed',
  PENDING: 'Pending',
  CREDIT_OWED: 'CreditOwed',
  PAID: 'Paid',
}

const worldpayPaymentStateMap = {
  AUTHORISED: commercetoolsPaymentStates.PENDING,
  CANCELLED: commercetoolsPaymentStates.BALANCE_DUE,
  CAPTURED: commercetoolsPaymentStates.PAID,
  SETTLED: commercetoolsPaymentStates.PAID,
  SETTLED_BY_MERCHANT: commercetoolsPaymentStates.PAID,
  REFUSED: commercetoolsPaymentStates.BALANCE_DUE,
  SENT_FOR_REFUND: null,
  REFUNDED: null,
  REFUNDED_BY_MERCHANT: null,
  SENT_FOR_AUTHORISATION: commercetoolsPaymentStates.PENDING,
  ERROR: commercetoolsPaymentStates.FAILED,
  EXPIRED: commercetoolsPaymentStates.BALANCE_DUE,
  REFUND_FAILED: commercetoolsPaymentStates.CREDIT_OWED,
  CAPTURE_FAILED: commercetoolsPaymentStates.BALANCE_DUE,
  SHOPPER_CANCELLED: commercetoolsPaymentStates.BALANCE_DUE,
  SHOPPER_REDIRECTED: commercetoolsPaymentStates.BALANCE_DUE,
  REFUND_WEBFORM_ISSUED: commercetoolsPaymentStates.BALANCE_DUE,
}

module.exports = {
  ROUTE: {
    HEALTH: '/health',
    PAYMENT: '',
    NOTIFICATION: '/notification',
  },
  COMMERCETOOLS: {
    PAYMENT_TRANSACTION_TYPES: {
      AUTHORIZATION: 'Authorization',
      CANCEL_AUTHORIZATION: 'CancelAuthorization',
      CHARGE: 'Charge',
      REFUND: 'Refund',
      CHARGEBACK: 'Chargeback',
    },
    PAYMENT_TRANSACTION_STATES: {
      INITIAL: 'Initial',
      PENDING: 'Pending',
      SUCCESS: 'Success',
      FAILURE: 'Failure',
    },
    PAYMENT_STATES: commercetoolsPaymentStates,
    WORLDPAY_PAYMENT_STATES_MAP: worldpayPaymentStateMap,
  },
}
