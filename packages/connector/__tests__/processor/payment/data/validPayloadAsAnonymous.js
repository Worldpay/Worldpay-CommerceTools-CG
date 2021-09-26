'use strict'

module.exports = {
  action: 'Create',
  resource: {
    typeId: 'payment',
    obj: {
      paymentMethodInfo: {
        paymentInterface: 'worldpay',
        method: 'card',
      },
      anonymousId: '849393fd-c4bf-46fb-bc37-183b40c3b39d',
      custom: {
        type: {
          typeId: 'type',
          id: '3dbf55c5-d23e-4e75-b514-3cac19d5c84c',
        },
        fields: {
          languageCode: 'de',
        },
      },
    },
  },
}
