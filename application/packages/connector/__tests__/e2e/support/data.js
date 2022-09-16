export const cartDraft = {
  currency: 'EUR',
  country: 'DE',
  customerEmail: 'charlie.bucket+ci@commercetools.com',
  shippingAddress: {
    title: 'Mr.',
    firstName: 'Charlie',
    lastName: 'Bucket',
    streetName: 'Sonnenallee',
    streetNumber: '223',
    additionalStreetInfo: '3. OG',
    postalCode: '12059',
    city: 'Berlin',
    country: 'DE',
    phone: '123456789',
    email: 'charlie.bucket+ci@commercetools.com',
  },
  billingAddress: {
    title: 'Mr.',
    firstName: 'Charlie',
    lastName: 'Bucket',
    streetName: 'Sonnenallee',
    streetNumber: '223',
    additionalStreetInfo: '3. OG',
    postalCode: '12059',
    city: 'Berlin',
    country: 'DE',
    phone: '123456789',
    email: 'charlie.bucket+ci@commercetools.com',
  },
  shippingMethod: {
    key: 'express-EU',
  },
  lineItems: [
    {
      sku: 'M0E20000000ELAJ',
    },
    {
      sku: 'M0E20000000DX1Y',
      quantity: 2,
    },
  ],
  discountCodes: ['SUNRISE_CI'],
}

export const updateMyCartAction = [
  {
    addLineItem: {
      sku: 'M0E20000000EF0X',
      quantity: 1,
    },
  },
]

export const paymentArguments = (cartId, paymentData) => {
  return {
    amountPlanned: {
      centAmount: 10300,
      currencyCode: 'EUR',
    },
    paymentMethodInfo: {
      paymentInterface: 'worldpay',
      method: 'card',
    },
    custom: {
      type: {
        key: 'worldpay-payment',
      },
      fields: {
        languageCode: 'en',
        cartId: cartId,
        paymentData: JSON.stringify(paymentData),
      },
    },
  }
}
