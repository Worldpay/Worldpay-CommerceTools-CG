'use strict'

const _ = require('lodash')

const PaymentOrderBuilder = require('../../../lib/processor/payment/PaymentOrderBuilder')
const WorldpayPaymentRequest = require('../../../lib/worldpay/WorldpayPaymentRequest')

const VALID_OPTIONS = {
  merchantCode: 'dummyMerchantCode',
  installationId: 'dummyInstallationId',
  xmlUsername: 'dummyXmlUsername',
  xmlPassword: 'dummyXmlPassword',
  macSecret: 'dummyMacSecret',
  timeout: 2000,
  env: 'test',
  includeFraudSight: false,
}

const VALID_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
  accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\n' +
    'accept-encoding: gzip, deflate, br\n',
}
const VALID_CUSTOMER_CART = require('./data/validCustomerCart')
const VALID_PAYLOAD_AS_CUSTOMER = require('./data/validPayloadAsCustomer')
const VALID_CUSTOMER = require('./data/validCustomer')
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
    })

    it('should call `createPaymentRequest`', () => {
      orderBuilder.build(
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER,
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS
      )
      expect(orderBuilder.createPaymentRequest).toHaveBeenCalledTimes(1)
      expect(orderBuilder.createPaymentRequest).toHaveBeenCalledWith(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS
      )
    })

    it('should call all risk data methods to apply risk data to the payment request`', () => {
      orderBuilder.build(VALID_CUSTOMER_CART, VALID_CUSTOMER, VALID_HEADERS)
      expect(orderBuilder.applyAuthenticationRiskData).toHaveBeenCalledTimes(1)
      expect(orderBuilder.applyAuthenticationRiskData).toHaveBeenCalledWith(
        'dummyPaymentRequest',
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER
      )
      expect(orderBuilder.applyShopperAccountRiskData).toHaveBeenCalledTimes(1)
      expect(orderBuilder.applyShopperAccountRiskData).toHaveBeenCalledWith(
        'dummyPaymentRequest',
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER
      )
      expect(orderBuilder.applyTransactionRiskData).toHaveBeenCalledTimes(1)
      expect(orderBuilder.applyTransactionRiskData).toHaveBeenCalledWith(
        'dummyPaymentRequest',
        VALID_CUSTOMER_CART
      )
      expect(orderBuilder.applyFraudSightData).toHaveBeenCalledTimes(0)
    })

    it('should call applyFraudSightData when the `includeFraudSight` option is passed in', () => {
      const orderBuilder = new PaymentOrderBuilder(
        { ...VALID_OPTIONS, includeFraudSight: true },
        VALID_PROJECT_DATA
      )
      orderBuilder.createPaymentRequest = jest.fn(() => 'dummyPaymentRequest')
      orderBuilder.applyAuthenticationRiskData = jest.fn(() => 'dummyApplyAuthenticationRiskData')
      orderBuilder.applyShopperAccountRiskData = jest.fn(() => 'dummyApplyShopperAccountRiskData')
      orderBuilder.applyTransactionRiskData = jest.fn(() => 'dummyApplyTransactionRiskData')
      orderBuilder.applyFraudSightData = jest.fn(() => 'dummyApplyFraudSightData')

      orderBuilder.build(
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER,
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS
      )

      expect(orderBuilder.applyFraudSightData).toHaveBeenCalledTimes(1)
      expect(orderBuilder.applyFraudSightData).toHaveBeenCalledWith(
        'dummyPaymentRequest',
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER
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
      orderBuilder.createPaymentRequest(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS
      )
      expect(orderBuilder.getOrderCode).toHaveBeenCalledTimes(1)
      expect(orderBuilder.getOrderCode).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER)
    })

    it('should call `getOrderDescription` with the cart object to retrieve the order description`', () => {
      orderBuilder.createPaymentRequest(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS
      )
      expect(orderBuilder.getOrderDescription).toHaveBeenCalledTimes(1)
      expect(orderBuilder.getOrderDescription).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER)
    })

    it('should call `getOrderContent` with the cart object to retrieve the order content`', () => {
      orderBuilder.createPaymentRequest(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS
      )
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
          emailAddress: 'jimmy@gradientedge.com',
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
        billingAddress: {
          address1: 'Another Test Address Line 1',
          address2: 'Another Test Address Line 2',
          city: 'Edinburgh',
          postalCode: 'NR9 4AB',
          countryCode: 'GB',
        },
      }
      const response = orderBuilder.createPaymentRequest(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        {
          userAgent: VALID_HEADERS['user-agent'],
          accept: VALID_HEADERS.accept,
        }
      )

      expect(JSON.parse(JSON.stringify(response))).toMatchObject(expectedResponse)
    })
  })

  describe('applyAuthenticationRiskData', () => {
    it("should return the payment request with a 'localAccount' method when using a customer account", () => {
      const paymentRequest = new WorldpayPaymentRequest()
      const response = orderBuilder.applyAuthenticationRiskData(
        paymentRequest,
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER
      )
      expect(response.authenticationRiskData.authenticationMethod).toBe('localAccount')
    })

    it("should return the payment request with a 'guestCheckout' method when using an anonymous account", () => {
      const paymentRequest = new WorldpayPaymentRequest()
      const response = orderBuilder.applyAuthenticationRiskData(
        paymentRequest,
        VALID_CUSTOMER_CART,
        null
      )
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
      const response = orderBuilder.applyAuthenticationRiskData(
        paymentRequest,
        VALID_CUSTOMER_CART,
        null
      )
      expect(response.authenticationRiskData.authenticationMethod).toBe('guestCheckout')
    })

    it('should identify the shipping name as matching the account name', () => {
      const paymentRequest = new WorldpayPaymentRequest()
      orderBuilder.isShippingNameSameAsAccountName = jest.fn(() => true)
      const response = orderBuilder.applyShopperAccountRiskData(
        paymentRequest,
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER
      )
      expect(response.shopperAccountRiskData.shippingNameMatchesAccountName).toBe(true)
    })

    it('should identify the shipping name as not matching the account name', () => {
      const paymentRequest = new WorldpayPaymentRequest()
      orderBuilder.isShippingNameSameAsAccountName = jest.fn(() => false)
      const response = orderBuilder.applyShopperAccountRiskData(
        paymentRequest,
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER
      )
      expect(response.shopperAccountRiskData.shippingNameMatchesAccountName).toBe(false)
    })
  })

  describe('applyTransactionRiskData', () => {
    it('should call `isShippingAddressSameAsBillingAddress` with the cart object', () => {
      orderBuilder.isShippingAddressSameAsBillingAddress = jest.fn(() => true)
      const paymentRequest = new WorldpayPaymentRequest()
      orderBuilder.applyTransactionRiskData(paymentRequest, VALID_CUSTOMER_CART)
      expect(orderBuilder.isShippingAddressSameAsBillingAddress).toHaveBeenCalledTimes(1)
      expect(orderBuilder.isShippingAddressSameAsBillingAddress).toHaveBeenCalledWith(
        VALID_CUSTOMER_CART
      )
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
      const paymentRequest = orderBuilder.createPaymentRequest(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        {
          userAgent: VALID_HEADERS['user-agent'],
          accept: VALID_HEADERS.accept,
        }
      )
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
      const paymentRequest = orderBuilder.createPaymentRequest(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        {
          userAgent: VALID_HEADERS['user-agent'],
          accept: VALID_HEADERS.accept,
        }
      )
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

    it('should throw an error when too many custom string or numeric fields are passed in', () => {
      const paymentRequest = orderBuilder.createPaymentRequest(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        {
          userAgent: VALID_HEADERS['user-agent'],
          accept: VALID_HEADERS.accept,
        }
      )
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
        })
      ).toBe(true)
    })
  })

  describe('isShippingNameSameAsAccountName', () => {
    it("should return false when the shipping name is different from the customer's profile name", () => {
      expect(
        orderBuilder.isShippingNameSameAsAccountName(VALID_CUSTOMER_CART, VALID_CUSTOMER)
      ).toBe(false)
    })

    it("should return true when the shipping name is the same as the customer's profile name", () => {
      expect(
        orderBuilder.isShippingNameSameAsAccountName(VALID_CUSTOMER_CART, {
          ...VALID_CUSTOMER,
          firstName: VALID_CUSTOMER_CART.shippingAddress.firstName,
          lastName: VALID_CUSTOMER_CART.shippingAddress.lastName,
        })
      ).toBe(true)
    })
  })

  describe('getOrderCode', () => {
    it('should return the payload payment id, given a cart object', () => {
      expect(orderBuilder.getOrderCode(VALID_PAYLOAD_AS_CUSTOMER)).toBe(
        VALID_PAYLOAD_AS_CUSTOMER.resource.id
      )
    })
  })

  describe('getOrderDescription', () => {
    it('should return the expected string based on the cart parameter and processor options', () => {
      expect(orderBuilder.getOrderDescription(VALID_PAYLOAD_AS_CUSTOMER)).toBe(
        'commercetools plugin v1.2.3 - testProjectKey - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7'
      )

      const processor2 = new PaymentOrderBuilder(VALID_OPTIONS, {
        ...VALID_PROJECT_DATA,
        key: 'test',
      })
      expect(processor2.getOrderDescription(VALID_PAYLOAD_AS_CUSTOMER)).toBe(
        'commercetools plugin v1.2.3 - test - order 3d6a6c13-354f-4a28-9113-3b6f4f2240e7'
      )
    })
  })

  describe('getOrderContent', () => {
    it('should call `getOrderDescription` with the payload object', () => {
      orderBuilder.getOrderDescription = jest.fn(() => 'dataFromGetOrderDescription')
      expect(orderBuilder.getOrderContent(VALID_PAYLOAD_AS_CUSTOMER)).toBe(
        'dataFromGetOrderDescription'
      )
      expect(orderBuilder.getOrderDescription).toHaveBeenCalledTimes(1)
      expect(orderBuilder.getOrderDescription).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER)
    })
  })
})
