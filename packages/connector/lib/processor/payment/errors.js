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
}
