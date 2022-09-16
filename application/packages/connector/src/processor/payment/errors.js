'use strict'

module.exports.detail = {
  NO_CART: {
    code: 'InvalidOperation',
    msg: 'No cart found for the given cart id `${cartId}`',
  },
  NO_SUCH_CUSTOMER: {
    code: 'InvalidOperation',
    msg: 'No customer found for id `${customerId}` on payment object',
  },
  NO_CUSTOMER_ANONYMOUS_ID: {
    code: 'InvalidInput',
    msg: `No customer id or anonymous id on payment object`,
  },
  UNEXPECTED_PAYMENT_INTERFACE: {
    code: 'InvalidInput',
    msg: "`paymentMethodInfo.paymentInterface` must be set to '${paymentInterface}'",
  },
  UNEXPECTED_PAYMENT_METHOD: {
    code: 'InvalidInput',
    msg: "`paymentMethodInfo.method` must be set to '${paymentMethod}'",
  },
  MISSING_PAYMENT_DATA_GOOGLE_PAY: {
    code: 'InvalidInput',
    msg: '`Google Pay is missing data paymentMethodData.tokenization.token: {protocolVersion: string, signature: string, signedMessage: string}`',
  },
  MISSING_PAYMENT_DATA_APPLE_PAY: {
    code: 'InvalidInput',
    msg: '`Apple Pay is missing data`',
  },
  APPLE_PAY_SESSION_MISSING_URL: {
    code: 'InvalidInput',
    msg: '`Apple Pay session initiation is missing URL in payment.custom.fields.paymentData (expects encoded JSON \'{ "validationURL": "https://apple.url/" }\')`',
  },
  APPLE_PAY_SESSION_MISSING_CERTS: {
    code: 'InvalidInput',
    msg: '`No certificate or private key found, please define them in environment variables WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_KEY and WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_CERT`',
  },
  APPLE_PAY_SESSION_FAILED: {
    code: 'InvalidOperation',
    msg: '`Failed to set up Apple Pay session`',
  },
  MISSING_PAYMENT_DATA_PRICES: {
    code: 'InvalidInput',
    msg: 'No price found for order line with id `${lineId}`, currencyCode `${currency}` and country `${country}`',
  },
  MISSING_TOKENISED_CARD_TOKEN: {
    code: 'InvalidInput',
    msg: "The tokenised card's token ID is missing",
  },
  GENERIC_ERROR: {
    code: 'InvalidField',
    msg: "${message}'",
  },
}

module.exports.codes = {
  NO_CART: 'NO_CART',
  NO_CUSTOMER_ANONYMOUS_ID: 'NO_CUSTOMER_ANONYMOUS_ID',
  UNEXPECTED_PAYMENT_INTERFACE: 'UNEXPECTED_PAYMENT_INTERFACE',
  UNEXPECTED_PAYMENT_METHOD: 'UNEXPECTED_PAYMENT_METHOD',
  UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
  MISSING_PAYMENT_DATA_GOOGLE_PAY: 'MISSING_PAYMENT_DATA_GOOGLE_PAY',
  MISSING_PAYMENT_DATA_APPLE_PAY: 'MISSING_PAYMENT_DATA_APPLE_PAY',
  MISSING_TOKENISED_CARD_TOKEN: 'MISSING_TOKENISED_CARD_TOKEN',
  APPLE_PAY_SESSION_MISSING_URL: 'APPLE_PAY_SESSION_MISSING_URL',
  APPLE_PAY_SESSION_MISSING_CERTS: 'APPLE_PAY_SESSION_MISSING_CERTS',
  APPLE_PAY_SESSION_FAILED: 'APPLE_PAY_SESSION_FAILED',
  MISSING_PAYMENT_DATA_PRICES: 'MISSING_PAYMENT_DATA_PRICES',
}
