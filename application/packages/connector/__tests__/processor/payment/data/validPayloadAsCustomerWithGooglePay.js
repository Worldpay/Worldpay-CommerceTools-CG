'use strict'

module.exports = {
  action: 'Create',
  resource: {
    id: '3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
    typeId: 'payment',
    obj: {
      paymentMethodInfo: {
        paymentInterface: 'worldpay',
        method: 'googlePay',
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
          paymentData:
            '{"method":"googlePay", "apiVersionMinor":0,"apiVersion":2,"paymentMethodData":{"description":"Visa •••• 1111","tokenizationData":{"type":"PAYMENT_GATEWAY","token":"{\\"signature\\":\\"MEUCIQCttT/vejfLBYUqPzQN0M8BUvx77AnGWwem7tOHPrqwsQIgXLo2aFogC53VK941A2lwjMktPlARITL9tjBPO+z+f54\\\\u003d\\",\\"protocolVersion\\":\\"ECv1\\",\\"signedMessage\\":\\"{\\\\\\"encryptedMessage\\\\\\":\\\\\\"+sQJkplXAQwxirPW7bDB+/xFk6OeQUwTb1CMM8rSs2WzBIhsb5eJoBzg+ZY+GLoQp/cYr4A/ScVozGDx9GJ1eYlBS6cR4AqG31dAjD8eR6IXoK+6MjMMikI8jgcIx3XVj/gNA6JsJ4uCq2iZZEA7n0cFHGKDi/kgXnKdVYtHoBdfX6A0kjnx/SWnoYjydoNbTGTb67qGNnkxdYV/LDpjDaLmufeHZvjofKNQUG8sq9qvkyLXCfVf6v6HUuq4ngvFbepRNeoYxpk5+dq6C+sCfpV2DfiJpHqrDXqclN0kWBIbM8concV4F3JUbwGbDZluXdf6F7RkQ2waYKSUG/hDXjqZFAE5MCdPYN2pVUndA0gJdAxh7sDzzzYFRXGYNMBp4yhj7E3vgOBHrz+0dnjI5aZo0+HZTw7I8oRgk6HTJa0hDi85jwJvN5ez/JDl/RqLourb2whpNLE\\\\\\\\u003d\\\\\\",\\\\\\"ephemeralPublicKey\\\\\\":\\\\\\"BDfCllr6hHIOhzwdWcRfmfMYYpWbtLj69NhgV00iuY+JsDjffjzBuQJghiqHUvuW4gBrcLaBKlW7H1pa+MlNLtQ\\\\\\\\u003d\\\\\\",\\\\\\"tag\\\\\\":\\\\\\"KAiYfb2anIHGaO1vKSHhHIj+Z8n0w/ODXHD1+bbWZwQ\\\\\\\\u003d\\\\\\"}\\"}"},"type":"CARD","info":{"cardNetwork":"VISA","cardDetails":"1111"}}}',
        },
      },
    },
  },
}
