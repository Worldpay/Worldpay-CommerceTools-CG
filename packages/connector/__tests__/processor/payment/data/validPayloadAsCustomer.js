'use strict'

module.exports = {
  action: 'Create',
  resource: {
    id: '3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
    typeId: 'payment',
    obj: {
      paymentMethodInfo: {
        paymentInterface: 'worldpay',
        method: 'card',
      },
      customer: {
        typeId: 'customer',
        id: '235f5976-fb6d-462e-8b2b-1bac25088043',
      },
      custom: {
        type: {
          typeId: 'type',
          id: '3dbf55c5-d23e-4e75-b514-3cac19d5c84c',
        },
        fields: {
          languageCode: 'en',
          cartId: 'dummy-cart-id',
        },
      },
    },
  },
}
