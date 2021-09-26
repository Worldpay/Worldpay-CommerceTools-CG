'use strict'

const { WORLDPAY_PSP_IDENTIFIER: PAYMENT_INTERFACE } = require('../../worldpay/constants')

module.exports = {
  PAYMENT_INTERFACE,
  PAYMENT_METHOD: 'card',
  DEFAULT_LANGUAGE_CODE: 'en',
  DEFAULT_TIMEOUT: 2000,
  PAYMENT_INTERFACE_INTERACTION_TYPE_KEY: 'worldpay-payment-interface-interaction',
  NOTIFICATION_INTERFACE_INTERACTION_TYPE_KEY: 'worldpay-notification-interface-interaction',
  PAYMENT_TYPE_KEY: 'worldpay-payment',
}
