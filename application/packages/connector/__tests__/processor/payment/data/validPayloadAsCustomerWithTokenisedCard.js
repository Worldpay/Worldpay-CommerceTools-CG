'use strict'

module.exports = {
  action: 'Create',
  resource: {
    id: '3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
    typeId: 'payment',
    obj: {
      paymentMethodInfo: {
        paymentInterface: 'worldpay',
        method: 'tokenisedCard',
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
          paymentData:
            '{"tokenEventReference":"TOK7854312","tokenReason":"Wanted another one","paymentTokenId":9902019934757792000,"cardBrand":"Mastercard","cardSubBrand":"MASTERCARD","issuerCountryCode":"N/A","obfuscatedPAN":"1234********9876","bin":"444433","method":"tokenisedCard", "cvc": "123"}',
        },
      },
    },
  },
}
