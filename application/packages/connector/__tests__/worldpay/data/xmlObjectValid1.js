'use strict'

module.exports = {
  paymentService: {
    notify: {
      orderStatusEvent: {
        '@orderCode': 'dummy-order-code',
        journal: {
          '@journalType': 'AUTHORISED',
        },
      },
    },
    '@version': 1.4,
    '@merchantCode': 'DUMMYMERCHANTCODE',
  },
}
