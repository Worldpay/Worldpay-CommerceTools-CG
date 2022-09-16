'use strict'

const { WORLDPAY_PSP_IDENTIFIER: PAYMENT_INTERFACE } = require('../../worldpay/constants')

module.exports = {
  PAYMENT_INTERFACE,
  PAYMENT_METHOD_CARD: 'card',
  PAYMENT_METHOD_TOKENISED_CARD: 'tokenisedCard',
  PAYMENT_METHOD_GOOGLE_PAY: 'googlePay',
  PAYMENT_METHOD_APPLE_PAY: 'applePay',
  PAYMENT_METHOD_PAYPAL: 'payPal',
  PAYMENT_METHOD_KLARNA_PAYNOW: 'klarnaPayNow',
  PAYMENT_METHOD_KLARNA_PAYLATER: 'klarnaPayLater',
  PAYMENT_METHOD_KLARNA_PAYSLICED: 'klarnaPaySliced',
  PAYMENT_METHOD_IDEAL: 'iDEAL',
  DEFAULT_LANGUAGE_CODE: 'en',
  DEFAULT_TIMEOUT: 2000,
  PAYMENT_INTERFACE_INTERACTION_TYPE_KEY: 'worldpay-payment-interface-interaction',
  NOTIFICATION_INTERFACE_INTERACTION_TYPE_KEY: 'worldpay-notification-interface-interaction',
  PAYMENT_TYPE_KEY: 'worldpay-payment',
}
