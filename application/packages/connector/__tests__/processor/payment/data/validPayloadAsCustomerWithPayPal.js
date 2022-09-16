'use strict'

module.exports = {
  action: 'Create',
  resource: {
    id: '3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
    typeId: 'payment',
    obj: {
      paymentMethodInfo: {
        paymentInterface: 'worldpay',
        method: 'payPal',
      },
      customer: {
        typeId: 'customer',
        id: 'customerId',
      },
      custom: {
        type: {
          typeId: 'type',
          id: '3dbf55c5-d23e-4e75-b514-3cac19d5c84c',
        },
        fields: {
          languageCode: 'en',
          cartId: '3879831f-d77d-456c-b87e-f1585332136a',
        },
      },
    },
  },
}
