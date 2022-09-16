'use strict'

const _ = require('lodash')

const PaymentOrderBuilder = require('../../../src/processor/payment/PaymentOrderBuilder')
const WorldpayPaymentRequest = require('../../../src/worldpay/WorldpayPaymentRequest')

const VALID_OPTIONS = {
  merchantCode: 'dummyMerchantCode',
  installationId: 'dummyInstallationId',
  xmlUsername: 'dummyXmlUsername',
  xmlPassword: 'dummyXmlPassword',
  macSecret: 'dummyMacSecret',
  timeout: 2000,
  env: 'test',
  includeFraudSight: false,
  termsURL: 'https://www.myvalidshop.com/t-n-c',
  returnURL: 'https://www.myvalidshop.com/checkout/',
  mapStateToISOCode: true,
}

const VALID_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
  accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\n' +
    'accept-encoding: gzip, deflate, br\n',
}
const VALID_CUSTOMER_CART = require('./data/validCustomerCart')
const VALID_CUSTOMER_CART_KLARNA = require('./data/validCustomerCartKlarna')
const VALID_PAYLOAD_AS_CUSTOMER = require('./data/validPayloadAsCustomer')
const VALID_PAYLOAD_AS_CUSTOMER_WITH_TOKENISED_CARD = require('./data/validPayloadAsCustomerWithTokenisedCard')
const VALID_PAYLOAD_AS_CUSTOMER_WITH_GOOGLE_PAY = require('./data/validPayloadAsCustomerWithGooglePay')
const VALID_PAYLOAD_AS_CUSTOMER_WITH_PAYPAL = require('./data/validPayloadAsCustomerWithPayPal')
const VALID_CUSTOMER = require('./data/validCustomer')
const {
  PAYMENT_METHOD_KLARNA_PAYLATER,
  PAYMENT_METHOD_KLARNA_PAYNOW,
  PAYMENT_METHOD_KLARNA_PAYSLICED,
  PAYMENT_METHOD_PAYPAL,
  PAYMENT_METHOD_IDEAL,
} = require('../../../src/processor/payment/constants')
const VALID_PROJECT_DATA = {
  key: 'testProjectKey',
  version: '1.2.3',
}

describe('PaymentOrderBuilder', () => {
  let orderBuilder

  beforeEach(() => {
    orderBuilder = new PaymentOrderBuilder(VALID_OPTIONS, VALID_PROJECT_DATA)
  })

  describe('constructor', () => {
    it('should set the `options` and `project` properties to the values passed in', () => {
      const testPaymentOrderBuilder = new PaymentOrderBuilder({ test: 1 }, { test: 2 })
      expect(testPaymentOrderBuilder.options).toEqual({ test: 1 })
      expect(testPaymentOrderBuilder.project).toEqual({ test: 2 })
    })
  })

  describe('build', () => {
    beforeEach(() => {
      orderBuilder.createPaymentRequest = jest.fn(() => 'dummyPaymentRequest')
      orderBuilder.applyAuthenticationRiskData = jest.fn(() => 'dummyApplyAuthenticationRiskData')
      orderBuilder.applyShopperAccountRiskData = jest.fn(() => 'dummyApplyShopperAccountRiskData')
      orderBuilder.applyTransactionRiskData = jest.fn(() => 'dummyApplyTransactionRiskData')
      orderBuilder.applyFraudSightData = jest.fn(() => 'dummyApplyFraudSightData')
      orderBuilder.applyCreateTokenData = jest.fn(() => 'dummyApplyCreateTokenData')
    })

    it('should call `createPaymentRequest`', () => {
      orderBuilder.build(VALID_CUSTOMER_CART, VALID_CUSTOMER, VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(orderBuilder.createPaymentRequest).toHaveBeenCalledTimes(1)
      expect(orderBuilder.createPaymentRequest).toHaveBeenCalledWith(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS,
      )
    })

    it('should call all risk data methods to apply risk data to the payment request`', () => {
      orderBuilder.build(VALID_CUSTOMER_CART, VALID_CUSTOMER, VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(orderBuilder.applyAuthenticationRiskData).toHaveBeenCalledTimes(1)
      expect(orderBuilder.applyAuthenticationRiskData).toHaveBeenCalledWith(
        'dummyPaymentRequest',
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER,
      )
      expect(orderBuilder.applyShopperAccountRiskData).toHaveBeenCalledTimes(1)
      expect(orderBuilder.applyShopperAccountRiskData).toHaveBeenCalledWith(
        'dummyPaymentRequest',
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER,
      )
      expect(orderBuilder.applyTransactionRiskData).toHaveBeenCalledTimes(1)
      expect(orderBuilder.applyTransactionRiskData).toHaveBeenCalledWith('dummyPaymentRequest', VALID_CUSTOMER_CART)
      expect(orderBuilder.applyFraudSightData).toHaveBeenCalledTimes(0)
    })

    it('should call applyFraudSightData when the `includeFraudSight` option is passed in', () => {
      const orderBuilder = new PaymentOrderBuilder({ ...VALID_OPTIONS, includeFraudSight: true }, VALID_PROJECT_DATA)
      orderBuilder.createPaymentRequest = jest.fn(() => 'dummyPaymentRequest')
      orderBuilder.applyAuthenticationRiskData = jest.fn(() => 'dummyApplyAuthenticationRiskData')
      orderBuilder.applyShopperAccountRiskData = jest.fn(() => 'dummyApplyShopperAccountRiskData')
      orderBuilder.applyTransactionRiskData = jest.fn(() => 'dummyApplyTransactionRiskData')
      orderBuilder.applyFraudSightData = jest.fn(() => 'dummyApplyFraudSightData')
      orderBuilder.applyCreateTokenData = jest.fn(() => 'dummyApplyCreateTokenData')

      orderBuilder.build(VALID_CUSTOMER_CART, VALID_CUSTOMER, VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)

      expect(orderBuilder.applyFraudSightData).toHaveBeenCalledTimes(1)
      expect(orderBuilder.applyFraudSightData).toHaveBeenCalledWith(
        'dummyPaymentRequest',
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER,
      )
    })

    it('should call `createPaymentRequest` for tokenised cards', () => {
      orderBuilder.build(
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER,
        VALID_PAYLOAD_AS_CUSTOMER_WITH_TOKENISED_CARD,
        VALID_HEADERS,
      )
      expect(orderBuilder.createPaymentRequest).toHaveBeenCalledTimes(1)
      expect(orderBuilder.createPaymentRequest).toHaveBeenCalledWith(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER_WITH_TOKENISED_CARD,
        VALID_HEADERS,
      )
    })

    it('should call `createPaymentRequest` for Google Pay', () => {
      orderBuilder.build(VALID_CUSTOMER_CART, VALID_CUSTOMER, VALID_PAYLOAD_AS_CUSTOMER_WITH_GOOGLE_PAY, VALID_HEADERS)
      expect(orderBuilder.createPaymentRequest).toHaveBeenCalledTimes(1)
      expect(orderBuilder.createPaymentRequest).toHaveBeenCalledWith(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER_WITH_GOOGLE_PAY,
        VALID_HEADERS,
      )
    })
  })

  describe('createPaymentRequest', () => {
    beforeEach(() => {
      orderBuilder.getOrderCode = jest.fn(() => 'testOrderCode')
      orderBuilder.getOrderDescription = jest.fn(() => 'testOrderDescription')
      orderBuilder.getOrderContent = jest.fn(() => 'testOrderContent')
    })

    it('should call `getOrderCode` with the cart object to retrieve the order code`', () => {
      orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(orderBuilder.getOrderCode).toHaveBeenCalledTimes(1)
      expect(orderBuilder.getOrderCode).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER)
    })

    it('should call `getOrderDescription` with the cart object to retrieve the order description`', () => {
      orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(orderBuilder.getOrderDescription).toHaveBeenCalledTimes(1)
      expect(orderBuilder.getOrderDescription).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER, true)
    })

    it('should call `getOrderContent` with the cart object to retrieve the order content`', () => {
      orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(orderBuilder.getOrderContent).toHaveBeenCalledTimes(1)
      expect(orderBuilder.getOrderContent).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER)
    })

    it('should return a `WorldpayPaymentRequest` instance with the correct data`', () => {
      const expectedResponse = {
        merchantCode: 'dummyMerchantCode',
        installationId: 'dummyInstallationId',
        orderCode: 'testOrderCode',
        orderDescription: 'testOrderDescription',
        orderContent: 'testOrderContent',
        orderCaptureDelay: 'DEFAULT',
        paymentMethodMask: {
          include: ['ALL'],
        },
        amount: {
          currencyCode: 'EUR',
          value: 179900,
          exponent: 2,
        },
        shopper: {
          emailAddress: 'jimmy+billing@gradientedge.com',
          browserUserAgentHeader: VALID_HEADERS['user-agent'],
          browserAcceptHeader: VALID_HEADERS.accept,
        },
        shippingAddress: {
          address1: 'Test Address Line 1',
          address2: 'Test Address Line 2',
          city: 'Norwich',
          state: 'Test state',
          postalCode: 'NR1 3PN',
          countryCode: 'GB',
        },
        billingAddress: {
          address1: 'Another Test Address Line 1',
          address2: 'Another Test Address Line 2',
          city: 'Edinburgh',
          postalCode: 'NR9 4AB',
          countryCode: 'GB',
        },
      }
      orderBuilder.hostedPaymentPage = true
      const response = orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, VALID_PAYLOAD_AS_CUSTOMER, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })

      expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
    })

    it('should return a `WorldpayPaymentRequest` instance with the correct data including States in China (if state is valid)`', () => {
      const expectedResponse = {
        billingAddress: {
          city: 'Shanghai',
          state: 'SH',
          countryCode: 'CN',
        },
        shippingAddress: {
          city: 'Shanghai',
          countryCode: 'CN',
        },
      }
      orderBuilder.hostedPaymentPage = true
      const cart = _.cloneDeep(VALID_CUSTOMER_CART)
      cart.billingAddress.city = 'Shanghai'
      cart.billingAddress.state = '上海市'
      cart.billingAddress.country = 'CN'
      cart.shippingAddress.city = 'Shanghai'
      cart.shippingAddress.state = '海市上 not a province'
      cart.shippingAddress.country = 'CN'
      const response = orderBuilder.createPaymentRequest(cart, VALID_PAYLOAD_AS_CUSTOMER, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })

      const responseObject = JSON.parse(JSON.stringify(response))
      expect(responseObject).toMatchObject(expectedResponse)
      expect(responseObject.shippingAddress.state).toBe(undefined)
    })

    it('should return a `WorldpayPaymentRequest` instance with the correct data including States in China (if state transformation is disabled)`', () => {
      const options = _.clone(VALID_OPTIONS)
      options.mapStateToISOCode = false
      orderBuilder = new PaymentOrderBuilder(options, VALID_PROJECT_DATA)

      const expectedResponse = {
        billingAddress: {
          city: 'Shanghai',
          state: '上海市',
          countryCode: 'CN',
        },
        shippingAddress: {
          city: 'Shanghai',
          state: '海市上 not a province',
          countryCode: 'CN',
        },
      }
      orderBuilder.hostedPaymentPage = true
      const cart = _.cloneDeep(VALID_CUSTOMER_CART)
      cart.billingAddress.city = 'Shanghai'
      cart.billingAddress.state = '上海市'
      cart.billingAddress.country = 'CN'
      cart.shippingAddress.city = 'Shanghai'
      cart.shippingAddress.state = '海市上 not a province'
      cart.shippingAddress.country = 'CN'
      const response = orderBuilder.createPaymentRequest(cart, VALID_PAYLOAD_AS_CUSTOMER, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })

      const responseObject = JSON.parse(JSON.stringify(response))
      expect(responseObject).toMatchObject(expectedResponse)
    })

    it('should return a `WorldpayPaymentRequest` instance with the correct data including States in US (supporting ISO-3611-2 values and ignoring case of state names)`', () => {
      const expectedResponse = {
        shippingAddress: {
          city: 'Denver',
          state: 'CO',
          countryCode: 'US',
        },
        billingAddress: {
          city: 'Denver',
          state: 'CO',
          countryCode: 'US',
        },
      }
      orderBuilder.hostedPaymentPage = true
      const cart = _.cloneDeep(VALID_CUSTOMER_CART)
      cart.billingAddress.city = 'Denver'
      cart.billingAddress.state = 'US-CO'
      cart.billingAddress.country = 'US'
      cart.shippingAddress.city = 'Denver'
      cart.shippingAddress.state = 'cOlOrADo'
      cart.shippingAddress.country = 'US'
      const response = orderBuilder.createPaymentRequest(cart, VALID_PAYLOAD_AS_CUSTOMER, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })

      expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
    })

    it('should return a `WorldpayPaymentRequest` instance with the correct data when the shipping address is missing`', () => {
      const expectedResponse = {
        merchantCode: 'dummyMerchantCode',
        installationId: 'dummyInstallationId',
        orderCode: 'testOrderCode',
        orderDescription: 'testOrderDescription',
        orderContent: 'testOrderContent',
        orderCaptureDelay: 'DEFAULT',
        paymentMethodMask: {
          include: ['ALL'],
        },
        amount: {
          currencyCode: 'EUR',
          value: 179900,
          exponent: 2,
        },
        shopper: {
          emailAddress: 'jimmy+billing@gradientedge.com',
          browserUserAgentHeader: VALID_HEADERS['user-agent'],
          browserAcceptHeader: VALID_HEADERS.accept,
        },
        billingAddress: {
          address1: 'Another Test Address Line 1',
          address2: 'Another Test Address Line 2',
          city: 'Edinburgh',
          postalCode: 'NR9 4AB',
          countryCode: 'GB',
        },
      }
      const cart = _.cloneDeep(VALID_CUSTOMER_CART)
      delete cart.shippingAddress
      orderBuilder.hostedPaymentPage = true
      const response = orderBuilder.createPaymentRequest(cart, VALID_PAYLOAD_AS_CUSTOMER, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })

      expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
    })

    it('should return a `WorldpayPaymentRequest` instance with the correct data when the billing address does not have streetName data`', () => {
      const expectedResponse = {
        merchantCode: 'dummyMerchantCode',
        installationId: 'dummyInstallationId',
        orderCode: 'testOrderCode',
        orderDescription: 'testOrderDescription',
        orderContent: 'testOrderContent',
        orderCaptureDelay: 'DEFAULT',
        paymentMethodMask: {
          include: ['ALL'],
        },
        amount: {
          currencyCode: 'EUR',
          value: 179900,
          exponent: 2,
        },
        shopper: {
          emailAddress: 'jimmy+billing@gradientedge.com',
          browserUserAgentHeader: VALID_HEADERS['user-agent'],
          browserAcceptHeader: VALID_HEADERS.accept,
        },
        shippingAddress: {
          address1: 'Test Address Line 1',
          address2: 'Test Address Line 2',
          city: 'Norwich',
          postalCode: 'NR1 3PN',
          countryCode: 'GB',
        },
      }
      const cart = _.cloneDeep(VALID_CUSTOMER_CART)
      delete cart.billingAddress.streetName
      orderBuilder.hostedPaymentPage = true
      const response = orderBuilder.createPaymentRequest(cart, VALID_PAYLOAD_AS_CUSTOMER, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })

      let parsedResponse = JSON.parse(JSON.stringify(response))
      expect(parsedResponse).toMatchObject(expectedResponse)
      expect(parsedResponse.billingAddress).toBeUndefined()
    })

    it('should return a `WorldpayPaymentRequest` instance with the correct data when the billing address does not have city data`', () => {
      const expectedResponse = {
        merchantCode: 'dummyMerchantCode',
        installationId: 'dummyInstallationId',
        orderCode: 'testOrderCode',
        orderDescription: 'testOrderDescription',
        orderContent: 'testOrderContent',
        orderCaptureDelay: 'DEFAULT',
        paymentMethodMask: {
          include: ['ALL'],
        },
        amount: {
          currencyCode: 'EUR',
          value: 179900,
          exponent: 2,
        },
        shopper: {
          emailAddress: 'jimmy+billing@gradientedge.com',
          browserUserAgentHeader: VALID_HEADERS['user-agent'],
          browserAcceptHeader: VALID_HEADERS.accept,
        },
        shippingAddress: {
          address1: 'Test Address Line 1',
          address2: 'Test Address Line 2',
          city: 'Norwich',
          postalCode: 'NR1 3PN',
          countryCode: 'GB',
        },
      }
      const cart = _.cloneDeep(VALID_CUSTOMER_CART)
      delete cart.billingAddress.city
      orderBuilder.hostedPaymentPage = true
      const response = orderBuilder.createPaymentRequest(cart, VALID_PAYLOAD_AS_CUSTOMER, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })

      expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
    })

    it('should return a `WorldpayPaymentRequest` instance with the correct data when the billing address does not have postalCode data`', () => {
      const expectedResponse = {
        merchantCode: 'dummyMerchantCode',
        installationId: 'dummyInstallationId',
        orderCode: 'testOrderCode',
        orderDescription: 'testOrderDescription',
        orderContent: 'testOrderContent',
        orderCaptureDelay: 'DEFAULT',
        paymentMethodMask: {
          include: ['ALL'],
        },
        amount: {
          currencyCode: 'EUR',
          value: 179900,
          exponent: 2,
        },
        shopper: {
          emailAddress: 'jimmy+billing@gradientedge.com',
          browserUserAgentHeader: VALID_HEADERS['user-agent'],
          browserAcceptHeader: VALID_HEADERS.accept,
        },
        shippingAddress: {
          address1: 'Test Address Line 1',
          address2: 'Test Address Line 2',
          city: 'Norwich',
          postalCode: 'NR1 3PN',
          countryCode: 'GB',
        },
      }
      const cart = _.cloneDeep(VALID_CUSTOMER_CART)
      delete cart.billingAddress.postalCode
      orderBuilder.hostedPaymentPage = true
      const response = orderBuilder.createPaymentRequest(cart, VALID_PAYLOAD_AS_CUSTOMER, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })

      expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
    })

    it('should return a `WorldpayPaymentRequest` instance with the correct data for a tokenised card`', () => {
      const expectedResponse = {
        merchantCode: 'dummyMerchantCode',
        installationId: 'dummyInstallationId',
        orderCode: 'testOrderCode',
        orderDescription: 'testOrderDescription',
        orderContent: 'testOrderContent',
        orderCaptureDelay: 'DEFAULT',
        amount: {
          currencyCode: 'EUR',
          value: 179900,
          exponent: 2,
        },
        paymentDetails: {
          paymentTokenID: 9902019934757792000,
          customerId: '235f5976-fb6d-462e-8b2b-1bac25088043',
        },
      }
      orderBuilder.hostedPaymentPage = false
      const response = orderBuilder.createPaymentRequest(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER_WITH_TOKENISED_CARD,
        {
          userAgent: VALID_HEADERS['user-agent'],
          accept: VALID_HEADERS.accept,
        },
      )

      expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
    })

    it('should return a `WorldpayPaymentRequest` instance with the correct data for Google Pay`', () => {
      const expectedResponse = {
        merchantCode: 'dummyMerchantCode',
        installationId: 'dummyInstallationId',
        orderCode: 'testOrderCode',
        orderDescription: 'testOrderDescription',
        orderContent: 'testOrderContent',
        orderCaptureDelay: 'DEFAULT',
        amount: {
          currencyCode: 'EUR',
          value: 179900,
          exponent: 2,
        },
        paymentDetails: {
          constraints: {
            protocolVersion: {
              presence: true,
            },
          },
        },
      }
      orderBuilder.hostedPaymentPage = false
      const response = orderBuilder.createPaymentRequest(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER_WITH_GOOGLE_PAY,
        {
          userAgent: VALID_HEADERS['user-agent'],
          accept: VALID_HEADERS.accept,
        },
      )

      expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
    })

    it('should return a `WorldpayPaymentRequest` instance with the correct data for Google Pay ', () => {
      const expectedResponse = {
        merchantCode: 'dummyMerchantCode',
        installationId: 'dummyInstallationId',
        orderCode: 'testOrderCode',
        orderDescription: 'testOrderDescription',
        orderContent: 'testOrderContent',
        orderCaptureDelay: 'DEFAULT',
        amount: {
          currencyCode: 'EUR',
          value: 179900,
          exponent: 2,
        },
        paymentDetails: {
          customerId: 'customerId',
          protocolVersion: 'ECv1',
          signature: 'MEUCIQCttT/vejfLBYUqPzQN0M8BUvx77AnGWwem7tOHPrqwsQIgXLo2aFogC53VK941A2lwjMktPlARITL9tjBPO+z+f54=',
          signedMessage:
            '{"encryptedMessage":"+sQJkplXAQwxirPW7bDB+/xFk6OeQUwTb1CMM8rSs2WzBIhsb5eJoBzg+ZY+GLoQp/cYr4A/ScVozGDx9GJ1eYlBS6cR4AqG31dAjD8eR6IXoK+6MjMMikI8jgcIx3XVj/gNA6JsJ4uCq2iZZEA7n0cFHGKDi/kgXnKdVYtHoBdfX6A0kjnx/SWnoYjydoNbTGTb67qGNnkxdYV/LDpjDaLmufeHZvjofKNQUG8sq9qvkyLXCfVf6v6HUuq4ngvFbepRNeoYxpk5+dq6C+sCfpV2DfiJpHqrDXqclN0kWBIbM8concV4F3JUbwGbDZluXdf6F7RkQ2waYKSUG/hDXjqZFAE5MCdPYN2pVUndA0gJdAxh7sDzzzYFRXGYNMBp4yhj7E3vgOBHrz+0dnjI5aZo0+HZTw7I8oRgk6HTJa0hDi85jwJvN5ez/JDl/RqLourb2whpNLE\\u003d","ephemeralPublicKey":"BDfCllr6hHIOhzwdWcRfmfMYYpWbtLj69NhgV00iuY+JsDjffjzBuQJghiqHUvuW4gBrcLaBKlW7H1pa+MlNLtQ\\u003d","tag":"KAiYfb2anIHGaO1vKSHhHIj+Z8n0w/ODXHD1+bbWZwQ\\u003d"}',
        },
        shopper: {
          emailAddress: 'jimmy+billing@gradientedge.com',
          browserUserAgentHeader: VALID_HEADERS['user-agent'],
          browserAcceptHeader: VALID_HEADERS.accept,
        },
      }
      const cart = _.cloneDeep(VALID_CUSTOMER_CART)
      delete cart.billingAddress.postalCode
      orderBuilder.hostedPaymentPage = false
      const response = orderBuilder.createPaymentRequest(cart, VALID_PAYLOAD_AS_CUSTOMER_WITH_GOOGLE_PAY, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })

      expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
    })
  })

  it('should return a `WorldpayPaymentRequest` instance with the correct data for PayPal`', () => {
    const expectedResponse = {
      merchantCode: 'dummyMerchantCode',
      installationId: 'dummyInstallationId',
      orderShopperLanguageCode: 'de',
      orderCode: '3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderDescription: 'commercetools plugin - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderContent: 'commercetools plugin - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderCaptureDelay: 'DEFAULT',
      amount: {
        currencyCode: 'EUR',
        value: 179900,
        exponent: 2,
      },
      paymentDetails: {
        cancelURL: VALID_OPTIONS.returnURL + '?status=cancel',
        successURL: VALID_OPTIONS.returnURL + '?status=success',
        failureURL: VALID_OPTIONS.returnURL + '?status=failure',
      },
    }

    const options = _.cloneDeep(VALID_OPTIONS)
    options.spacesInPaypalDescription = true
    orderBuilder = new PaymentOrderBuilder(options, VALID_PROJECT_DATA)
    orderBuilder.hostedPaymentPage = false
    const payload = _.cloneDeep(VALID_PAYLOAD_AS_CUSTOMER)
    payload.resource.obj.paymentMethodInfo.method = PAYMENT_METHOD_PAYPAL

    const response = orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, payload, {
      userAgent: VALID_HEADERS['user-agent'],
      accept: VALID_HEADERS.accept,
    })

    expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
  })

  it('should return a `WorldpayPaymentRequest` instance with a space-less description for PayPal is `', () => {
    const expectedResponse = {
      merchantCode: 'dummyMerchantCode',
      installationId: 'dummyInstallationId',
      orderShopperLanguageCode: 'de',
      orderCode: '3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderDescription: 'commercetools_plugin_-_testProjectKey_-_order_3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderContent: 'commercetools plugin - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderCaptureDelay: 'DEFAULT',
      amount: {
        currencyCode: 'EUR',
        value: 179900,
        exponent: 2,
      },
      paymentDetails: {
        cancelURL: VALID_OPTIONS.returnURL + '?status=cancel',
        successURL: VALID_OPTIONS.returnURL + '?status=success',
        failureURL: VALID_OPTIONS.returnURL + '?status=failure',
      },
    }

    orderBuilder.hostedPaymentPage = false
    const payload = _.cloneDeep(VALID_PAYLOAD_AS_CUSTOMER)
    payload.resource.obj.paymentMethodInfo.method = PAYMENT_METHOD_PAYPAL

    const response = orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, payload, {
      userAgent: VALID_HEADERS['user-agent'],
      accept: VALID_HEADERS.accept,
    })

    expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
  })

  it('should return a `WorldpayPaymentRequest` instance with the correct data for Klarna Pay Now`', () => {
    const expectedResponse = {
      merchantCode: 'dummyMerchantCode',
      installationId: 'dummyInstallationId',
      orderCode: '3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderDescription: 'commercetools plugin - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderContent: 'commercetools plugin - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderCaptureDelay: 'DEFAULT',
      amount: {
        currencyCode: 'EUR',
        value: 179900,
        exponent: 2,
      },
      shippingAddress: {
        firstName: 'Joe',
        telephoneNumber: '1999',
      },
      billingAddress: {
        firstName: 'Fred',
        telephoneNumber: '1234',
      },
      paymentDetails: {
        cancelURL: VALID_OPTIONS.returnURL + '?status=cancel',
        successURL: VALID_OPTIONS.returnURL + '?status=success',
        failureURL: VALID_OPTIONS.returnURL + '?status=failure',
        pendingURL: VALID_OPTIONS.returnURL + '?status=pending',
        locale: 'de-DE',
        country: 'DE',
      },
    }
    orderBuilder.hostedPaymentPage = false
    const payload = _.cloneDeep(VALID_PAYLOAD_AS_CUSTOMER)
    payload.resource.obj.paymentMethodInfo.method = PAYMENT_METHOD_KLARNA_PAYNOW

    const response = orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, payload, {
      userAgent: VALID_HEADERS['user-agent'],
      accept: VALID_HEADERS.accept,
    })

    expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
  })

  it('should return a `WorldpayPaymentRequest` instance with the correct data for Klarna Pay Later`', () => {
    const expectedResponse = {
      merchantCode: 'dummyMerchantCode',
      installationId: 'dummyInstallationId',
      orderCode: '3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderDescription: 'commercetools plugin - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderContent: 'commercetools plugin - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderCaptureDelay: 'DEFAULT',
      amount: {
        currencyCode: 'EUR',
        value: 179900,
        exponent: 2,
      },
      shippingAddress: {
        firstName: 'Joe',
        telephoneNumber: '1999',
      },
      billingAddress: {
        firstName: 'Fred',
        telephoneNumber: '1234',
      },
      paymentDetails: {
        cancelURL: VALID_OPTIONS.returnURL + '?status=cancel',
        successURL: VALID_OPTIONS.returnURL + '?status=success',
        failureURL: VALID_OPTIONS.returnURL + '?status=failure',
        pendingURL: VALID_OPTIONS.returnURL + '?status=pending',
        locale: 'de-DE',
        country: 'DE',
      },
    }
    orderBuilder.hostedPaymentPage = false
    const payload = _.cloneDeep(VALID_PAYLOAD_AS_CUSTOMER)
    payload.resource.obj.paymentMethodInfo.method = PAYMENT_METHOD_KLARNA_PAYLATER

    const response = orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, payload, {
      userAgent: VALID_HEADERS['user-agent'],
      accept: VALID_HEADERS.accept,
    })

    expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
  })

  it('should return a `WorldpayPaymentRequest` instance with the correct data for Klarna Pay Sliced`', () => {
    const expectedResponse = {
      merchantCode: 'dummyMerchantCode',
      installationId: 'dummyInstallationId',
      orderCode: '3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderDescription: 'commercetools plugin - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderContent: 'commercetools plugin - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderCaptureDelay: 'DEFAULT',
      amount: {
        currencyCode: 'EUR',
        value: 179900,
        exponent: 2,
      },
      shippingAddress: {
        firstName: 'Joe',
        telephoneNumber: '1999',
      },
      billingAddress: {
        firstName: 'Fred',
        telephoneNumber: '1234',
      },
      paymentDetails: {
        cancelURL: VALID_OPTIONS.returnURL + '?status=cancel',
        successURL: VALID_OPTIONS.returnURL + '?status=success',
        failureURL: VALID_OPTIONS.returnURL + '?status=failure',
        pendingURL: VALID_OPTIONS.returnURL + '?status=pending',
        locale: 'de-DE',
        country: 'DE',
      },
    }
    orderBuilder.hostedPaymentPage = false
    const payload = _.cloneDeep(VALID_PAYLOAD_AS_CUSTOMER)
    payload.resource.obj.paymentMethodInfo.method = PAYMENT_METHOD_KLARNA_PAYSLICED

    const response = orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, payload, {
      userAgent: VALID_HEADERS['user-agent'],
      accept: VALID_HEADERS.accept,
    })

    expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
  })

  it('should return a `WorldpayPaymentRequest` instance with the correct data for iDEAL`', () => {
    const expectedResponse = {
      merchantCode: 'dummyMerchantCode',
      installationId: 'dummyInstallationId',
      orderCode: '3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderDescription: 'commercetools plugin - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderContent: 'commercetools plugin - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      orderCaptureDelay: 'DEFAULT',
      amount: {
        currencyCode: 'EUR',
        value: 179900,
        exponent: 2,
      },
      paymentDetails: {
        cancelURL: VALID_OPTIONS.returnURL + '?status=cancel',
        successURL: VALID_OPTIONS.returnURL + '?status=success',
        failureURL: VALID_OPTIONS.returnURL + '?status=failure',
        pendingURL: VALID_OPTIONS.returnURL + '?status=pending',
      },
    }
    orderBuilder.hostedPaymentPage = false
    const payload = _.cloneDeep(VALID_PAYLOAD_AS_CUSTOMER)
    payload.resource.obj.paymentMethodInfo.method = PAYMENT_METHOD_IDEAL

    const response = orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, payload, {
      userAgent: VALID_HEADERS['user-agent'],
      accept: VALID_HEADERS.accept,
    })

    expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
  })

  describe('applyAuthenticationRiskData', () => {
    it("should return the payment request with a 'localAccount' method when using a customer account", () => {
      const paymentRequest = new WorldpayPaymentRequest()
      const response = orderBuilder.applyAuthenticationRiskData(paymentRequest, VALID_CUSTOMER_CART, VALID_CUSTOMER)
      expect(response.authenticationRiskData.authenticationMethod).toBe('localAccount')
    })

    it("should return the payment request with a 'guestCheckout' method when using an anonymous account", () => {
      const paymentRequest = new WorldpayPaymentRequest()
      const response = orderBuilder.applyAuthenticationRiskData(paymentRequest, VALID_CUSTOMER_CART, null)
      expect(response.authenticationRiskData.authenticationMethod).toBe('guestCheckout')
    })
  })

  describe('applyShopperAccountRiskData', () => {
    it('should return the exact same payment request with no changes if customer is null', () => {
      const paymentRequest = new WorldpayPaymentRequest()
      const paymentRequestRiskData = _.cloneDeep(paymentRequest.buildRiskData())
      orderBuilder.applyShopperAccountRiskData(paymentRequest, VALID_CUSTOMER_CART, null)
      expect(paymentRequestRiskData).toEqual(paymentRequest.buildRiskData())
    })

    it("should return the payment request with a 'guestCheckout' method when using an anonymous account", () => {
      const paymentRequest = new WorldpayPaymentRequest()
      const response = orderBuilder.applyAuthenticationRiskData(paymentRequest, VALID_CUSTOMER_CART, null)
      expect(response.authenticationRiskData.authenticationMethod).toBe('guestCheckout')
    })

    it('should identify the shipping name as matching the account name', () => {
      const paymentRequest = new WorldpayPaymentRequest()
      orderBuilder.isShippingNameSameAsAccountName = jest.fn(() => true)
      const response = orderBuilder.applyShopperAccountRiskData(paymentRequest, VALID_CUSTOMER_CART, VALID_CUSTOMER)
      expect(response.shopperAccountRiskData.shippingNameMatchesAccountName).toBe(true)
    })

    it('should identify the shipping name as not matching the account name', () => {
      const paymentRequest = new WorldpayPaymentRequest()
      orderBuilder.isShippingNameSameAsAccountName = jest.fn(() => false)
      const response = orderBuilder.applyShopperAccountRiskData(paymentRequest, VALID_CUSTOMER_CART, VALID_CUSTOMER)
      expect(response.shopperAccountRiskData.shippingNameMatchesAccountName).toBe(false)
    })
  })

  describe('applyTransactionRiskData', () => {
    it('should call `isShippingAddressSameAsBillingAddress` with the cart object', () => {
      orderBuilder.isShippingAddressSameAsBillingAddress = jest.fn(() => true)
      const paymentRequest = new WorldpayPaymentRequest()
      orderBuilder.applyTransactionRiskData(paymentRequest, VALID_CUSTOMER_CART)
      expect(orderBuilder.isShippingAddressSameAsBillingAddress).toHaveBeenCalledTimes(1)
      expect(orderBuilder.isShippingAddressSameAsBillingAddress).toHaveBeenCalledWith(VALID_CUSTOMER_CART)
    })

    it("should set the transaction risk data method to 'shipToBillingAddress' when the shipping and billing address are identical", () => {
      const paymentRequest = new WorldpayPaymentRequest()
      orderBuilder.isShippingAddressSameAsBillingAddress = jest.fn(() => true)
      const response = orderBuilder.applyTransactionRiskData(paymentRequest, VALID_CUSTOMER_CART)
      expect(response.transactionRiskData.shippingMethod).toBe('shipToBillingAddress')
    })

    it("should set the transaction risk data method to 'shipToOtherAddress' when the shipping and billing address are not identical", () => {
      const paymentRequest = new WorldpayPaymentRequest()
      orderBuilder.isShippingAddressSameAsBillingAddress = jest.fn(() => false)
      const response = orderBuilder.applyTransactionRiskData(paymentRequest, VALID_CUSTOMER_CART)
      expect(response.transactionRiskData.shippingMethod).toBe('shipToOtherAddress')
    })
  })

  describe('applyFraudSightData', () => {
    it('should set the fraudSightData correctly when a customer is not passed in', () => {
      const paymentRequest = orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, VALID_PAYLOAD_AS_CUSTOMER, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })
      orderBuilder.applyFraudSightData(paymentRequest, VALID_CUSTOMER_CART, null)
      expect(paymentRequest.fraudSightData).toMatchObject({
        address: {
          address1: 'Another Test Address Line 1',
          address2: 'Another Test Address Line 2',
          city: 'Edinburgh',
          countryCode: 'GB',
          postalCode: 'NR9 4AB',
        },
      })
    })

    it('should set the fraudSightData correctly when a customer is passed in', () => {
      const paymentRequest = orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, VALID_PAYLOAD_AS_CUSTOMER, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })
      orderBuilder.applyFraudSightData(paymentRequest, VALID_CUSTOMER_CART, VALID_CUSTOMER)
      expect(paymentRequest.fraudSightData).toMatchObject({
        address: {
          address1: 'Another Test Address Line 1',
          address2: 'Another Test Address Line 2',
          city: 'Edinburgh',
          countryCode: 'GB',
          state: 'Midlothian',
          postalCode: 'NR9 4AB',
        },
        shopperId: 'test-customer-id',
        shopperName: 'Fred Smith',
      })
    })

    it('should throw an error when too many custom string or numeric fields are passed in', () => {
      const paymentRequest = orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, VALID_PAYLOAD_AS_CUSTOMER, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })
      orderBuilder.applyFraudSightData(paymentRequest, VALID_CUSTOMER_CART, VALID_CUSTOMER)
      expect(paymentRequest.fraudSightData).toMatchObject({
        address: {
          address1: 'Another Test Address Line 1',
          address2: 'Another Test Address Line 2',
          city: 'Edinburgh',
          countryCode: 'GB',
          postalCode: 'NR9 4AB',
        },
        shopperId: 'test-customer-id',
        shopperName: 'Fred Smith',
      })
    })
  })

  describe('isShippingAddressSameAsBillingAddress', () => {
    it('should return false when the cart has different shipping and billing addresses', () => {
      expect(orderBuilder.isShippingAddressSameAsBillingAddress(VALID_CUSTOMER_CART)).toBe(false)
    })

    it('should return true when the cart has different shipping and billing addresses', () => {
      expect(
        orderBuilder.isShippingAddressSameAsBillingAddress({
          ...VALID_CUSTOMER_CART,
          shippingAddress: VALID_CUSTOMER_CART.billingAddress,
        }),
      ).toBe(true)
    })
  })

  describe('isShippingNameSameAsAccountName', () => {
    it("should return false when the shipping name is different from the customer's profile name", () => {
      expect(orderBuilder.isShippingNameSameAsAccountName(VALID_CUSTOMER_CART, VALID_CUSTOMER)).toBe(false)
    })

    it("should return true when the shipping name is the same as the customer's profile name", () => {
      expect(
        orderBuilder.isShippingNameSameAsAccountName(VALID_CUSTOMER_CART, {
          ...VALID_CUSTOMER,
          firstName: VALID_CUSTOMER_CART.shippingAddress.firstName,
          lastName: VALID_CUSTOMER_CART.shippingAddress.lastName,
        }),
      ).toBe(true)
    })

    it('should return false when the customer object is null', () => {
      expect(orderBuilder.isShippingNameSameAsAccountName(VALID_CUSTOMER_CART, null)).toBe(false)
    })

    it('should return false when the shipping address first/last name fields are missing', () => {
      const cart = _.cloneDeep(VALID_CUSTOMER_CART)
      delete cart.shippingAddress.firstName
      delete cart.shippingAddress.lastName
      expect(
        orderBuilder.isShippingNameSameAsAccountName(cart, {
          ...VALID_CUSTOMER,
          firstName: VALID_CUSTOMER_CART.shippingAddress.firstName,
          lastName: VALID_CUSTOMER_CART.shippingAddress.lastName,
        }),
      ).toBe(false)
    })

    it('should return false when the shipping address first/last name fields are blank', () => {
      const cart = _.cloneDeep(VALID_CUSTOMER_CART)
      cart.shippingAddress.firstName = ''
      cart.shippingAddress.lastName = ''
      expect(
        orderBuilder.isShippingNameSameAsAccountName(cart, {
          ...VALID_CUSTOMER,
          firstName: VALID_CUSTOMER_CART.shippingAddress.firstName,
          lastName: VALID_CUSTOMER_CART.shippingAddress.lastName,
        }),
      ).toBe(false)
    })

    it('should return false when the customer first/last name fields are missing', () => {
      const customer = _.cloneDeep(VALID_CUSTOMER)
      delete customer.firstName
      delete customer.lastName
      expect(orderBuilder.isShippingNameSameAsAccountName(VALID_CUSTOMER_CART, customer)).toBe(false)
    })

    it('should return false when the customer first/last name fields are empty', () => {
      const customer = _.cloneDeep(VALID_CUSTOMER)
      customer.firstName = ''
      customer.lastName = ''
      expect(orderBuilder.isShippingNameSameAsAccountName(VALID_CUSTOMER_CART, customer)).toBe(false)
    })

    it('should return false when the both the shipping address and customer first/last name fields are empty', () => {
      const customer = _.cloneDeep(VALID_CUSTOMER)
      customer.firstName = ''
      customer.lastName = ''
      const cart = _.cloneDeep(VALID_CUSTOMER_CART)
      cart.shippingAddress.firstName = ''
      cart.shippingAddress.lastName = ''
      expect(orderBuilder.isShippingNameSameAsAccountName(cart, customer)).toBe(false)
    })
  })

  describe('getTokenEventReference', () => {
    it('should return a prefix orderCode, given a cart object', () => {
      expect(orderBuilder.getTokenEventReference(VALID_CUSTOMER_CART)).toBe(
        'Order_3d6a6c13_354f_4a28_9113_3b6f4f2240e7',
      )
    })
  })

  describe('getOrderCode', () => {
    it('should return the payload payment id, given a cart object', () => {
      expect(orderBuilder.getOrderCode(VALID_PAYLOAD_AS_CUSTOMER)).toBe(VALID_PAYLOAD_AS_CUSTOMER.resource.id)
    })
  })

  describe('getOrderDescription', () => {
    it('should return the expected string based on the cart parameter and processor options', () => {
      expect(orderBuilder.getOrderDescription(VALID_PAYLOAD_AS_CUSTOMER)).toBe(
        'commercetools plugin - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      )

      const processor2 = new PaymentOrderBuilder(VALID_OPTIONS, {
        ...VALID_PROJECT_DATA,
        key: 'test',
      })
      expect(processor2.getOrderDescription(VALID_PAYLOAD_AS_CUSTOMER)).toBe(
        'commercetools plugin - test - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7',
      )
    })

    it('description should be empty for paypal`', () => {
      const description = orderBuilder.getOrderDescription(VALID_PAYLOAD_AS_CUSTOMER_WITH_PAYPAL)
      console.log(description)
    })
  })

  describe('getOrderContent', () => {
    it('should call `getOrderDescription` with the payload object', () => {
      orderBuilder.getOrderDescription = jest.fn(() => 'dataFromGetOrderDescription')
      expect(orderBuilder.getOrderContent(VALID_PAYLOAD_AS_CUSTOMER)).toBe('dataFromGetOrderDescription')
      expect(orderBuilder.getOrderDescription).toHaveBeenCalledTimes(1)
      expect(orderBuilder.getOrderDescription).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER, true)
    })
  })

  describe('getOrderLines', () => {
    it('give expected order lines for Worldpay', () => {
      const payload = _.cloneDeep(VALID_PAYLOAD_AS_CUSTOMER)
      payload.resource.obj.paymentMethodInfo.method = 'klarnaPayNow'
      const result = orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART, payload, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })

      const sumOfLineItems = result.orderLines.lineItems.reduce((sum, lineItem) => sum + lineItem.totalAmount, 0)
      expect(result.amount.value).toEqual(sumOfLineItems)

      expect(result.orderLines).toMatchObject({
        orderTaxAmount: 28723,
        termsURL: 'https://www.myvalidshop.com/t-n-c',
        lineItems: [
          {
            type: 'physical',
            reference: '0a2e7f42-04b1-4cd9-aa85-95a2b3c05ec6',
            name: 'Bluse Michael Kors rot',
            quantity: 1,
            quantityUnit: 1,
            unitPrice: 24000,
            taxRate: 1900,
            totalAmount: 24000,
            totalTaxAmount: 3832,
            totalDiscountAmount: 0,
          },
          {
            type: 'physical',
            reference: 'a726ea7b-dba9-4d5a-8c05-e3768f1df6ed',
            name: 'Moncler – Daunenweste „Dupres“',
            quantity: 2,
            quantityUnit: 1,
            unitPrice: 23750,
            taxRate: 1900,
            totalAmount: 47500,
            totalTaxAmount: 7584,
            totalDiscountAmount: 0,
          },
          {
            type: 'physical',
            reference: '98644568-f0cb-4cd9-88c2-fcc579ec1b31',
            name: 'Tasche „Selma“ medium Michael Kors rot',
            quantity: 1,
            quantityUnit: 1,
            unitPrice: 29500,
            taxRate: 1900,
            totalAmount: 29500,
            totalTaxAmount: 4710,
            totalDiscountAmount: 0,
          },
          {
            // ...
            name: 'Handtasche von Karl Lagerfeld',
            quantity: 1,
            totalAmount: 64900,
          },
          {
            // ...
            name: 'Michael Kors – Brieftasche „Jet Set Travel“',
            quantity: 1,
            totalAmount: 14000,
          },
        ],
      })
    })

    it('give expected order lines for Worldpay with shippingFree', () => {
      const payload = _.cloneDeep(VALID_PAYLOAD_AS_CUSTOMER)
      payload.resource.obj.paymentMethodInfo.method = 'klarnaPayNow'
      const result = orderBuilder.createPaymentRequest(VALID_CUSTOMER_CART_KLARNA, payload, {
        userAgent: VALID_HEADERS['user-agent'],
        accept: VALID_HEADERS.accept,
      })

      const sumOfLineItems = result.orderLines.lineItems.reduce((sum, lineItem) => sum + lineItem.totalAmount, 0)
      expect(result.amount.value).toEqual(sumOfLineItems)

      expect(result.orderLines).toMatchObject({
        orderTaxAmount: 11704,
        termsURL: 'https://www.myvalidshop.com/t-n-c',
        lineItems: [
          {
            type: 'physical',
            reference: 'b5660bd9-6894-4d04-8088-6eb3f8fda6d9',
            name: 'Michael Kors – Bluse',
            quantity: 1,
            quantityUnit: 1,
            unitPrice: 15500,
            taxRate: 1900,
            totalAmount: 15500,
            totalTaxAmount: 2475,
            totalDiscountAmount: 0,
          },
          {
            type: 'physical',
            reference: '12b4e191-a58e-4784-9270-832954b27513',
            name: 'Pullover Moncler rot',
            quantity: 2,
            quantityUnit: 1,
            unitPrice: 12000,
            taxRate: 1900,
            totalAmount: 48000,
            totalTaxAmount: 7664,
            totalDiscountAmount: 0,
          },
          {
            type: 'physical',
            reference: '8da351c3-1df8-4a17-a44f-ffeb93042b10',
            name: 'Brieftasche „Rimini“ Gabs hellrot',
            quantity: 1,
            quantityUnit: 1,
            unitPrice: 8800,
            taxRate: 1900,
            totalAmount: 8800,
            totalTaxAmount: 1405,
            totalDiscountAmount: 0,
          },
          {
            reference: 'shippingCost',
            type: 'shippingFee',
            name: 'Shipping Cost',
            quantity: 1,
            quantityUnit: 1,
            taxRate: 1900,
            unitPrice: 1000,
            totalAmount: 1000,
            totalTaxAmount: 160,
          },
        ],
      })
    })
  })
})
