'use strict'

const _ = require('lodash')
const CommercetoolsClient = require('../../../lib/commercetools/Client')
const PaymentProcessor = require('../../../lib/processor/payment/PaymentProcessor')
const PaymentRequestHandler = require('../../../lib/processor/payment/PaymentRequestHandler')

const VALID_OPTIONS = {
  merchantCode: 'dummyMerchantCode',
  installationId: 'dummyInstallationId',
  xmlUsername: 'dummyXmlUsername',
  xmlPassword: 'dummyXmlPassword',
  macSecret: 'dummyMacSecret',
  timeout: 2000,
  env: 'test',
}

const VALID_PAYLOAD_AS_CUSTOMER = require('./data/validPayloadAsCustomer')
const VALID_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
  accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\n' +
    'accept-encoding: gzip, deflate, br\n',
}
const VALID_PROJECT_DATA = {
  key: 'testProjectKey',
  version: '1.2.3',
}

describe('PaymentProcessor', () => {
  let commercetoolsClient
  let processor

  beforeEach(() => {
    commercetoolsClient = new CommercetoolsClient({
      projectKey: 'dummyprojectkey',
      clientId: 'dummyclientid',
      clientSecret: 'dummyclientsecret',
      apiUrl: 'https://dummyapiurl.com',
      authUrl: 'https://dummyauthurl.com',
    })
    // We spyOn/mock this method to ensure that we don't try and communicate with Worldpay
    commercetoolsClient.execute = jest.fn()

    processor = new PaymentProcessor(commercetoolsClient, VALID_OPTIONS, VALID_PROJECT_DATA)
  })

  describe('constructor', () => {
    it('should throw an Error type exception when the `commercetoolsClient` parameter is invalid', () => {
      expect(() => new PaymentProcessor(null, VALID_OPTIONS)).toThrow(
        new Error('`commercetoolsClient` parameter must be of type CommercetoolsClient')
      )

      expect(() => new PaymentProcessor('test', VALID_OPTIONS)).toThrow(
        new Error('`commercetoolsClient` parameter must be of type CommercetoolsClient')
      )

      expect(() => new PaymentProcessor({}, VALID_OPTIONS)).toThrow(
        new Error('`commercetoolsClient` parameter must be of type CommercetoolsClient')
      )
    })

    it('should throw an Error when any expected options are missing', () => {
      expect(() => new PaymentProcessor(commercetoolsClient)).toThrow(
        new Error('`options` parameter is missing or empty')
      )

      expect(() => new PaymentProcessor(commercetoolsClient, {})).toThrow(
        new Error('`options` parameter is missing or empty')
      )

      expect(
        () => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['merchantCode']))
      ).toThrow(new Error('`options` parameter is missing required properties: merchantCode'))

      expect(
        () => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['installationId']))
      ).toThrow(new Error('`options` parameter is missing required properties: installationId'))

      expect(
        () => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['xmlUsername']))
      ).toThrow(new Error('`options` parameter is missing required properties: xmlUsername'))

      expect(
        () => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['xmlPassword']))
      ).toThrow(new Error('`options` parameter is missing required properties: xmlPassword'))

      expect(
        () => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['macSecret']))
      ).toThrow(new Error('`options` parameter is missing required properties: macSecret'))

      expect(
        () => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['env']))
      ).toThrow(new Error('`options` parameter is missing required properties: env'))

      expect(
        () =>
          new PaymentProcessor(
            commercetoolsClient,
            _.omit(VALID_OPTIONS, ['macSecret', 'installationId'])
          )
      ).toThrow(
        new Error('`options` parameter is missing required properties: installationId, macSecret')
      )
    })

    it('should default the `timeout` to the expected value', () => {
      const options = { ...VALID_OPTIONS }
      let processor
      delete options.timeout
      expect(() => {
        processor = new PaymentProcessor(commercetoolsClient, options)
      }).not.toThrow()
      expect(processor.options.timeout).toBe(2000)
    })
  })

  describe('execute', () => {
    it('should default `headers` param to an empty object', async () => {
      processor.isRequestApplicable = jest.fn(() => true)
      processor.dispatchToHandler = jest.fn(() => 'dummyResponse')
      const response = await processor.execute(VALID_PAYLOAD_AS_CUSTOMER)
      expect(response).toBe('dummyResponse')
      expect(processor.dispatchToHandler).toHaveBeenCalledTimes(1)
      expect(processor.dispatchToHandler).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER, {})
    })

    it('should call the `isRequestApplicable` method to check if the request should be processed', async () => {
      processor.isRequestApplicable = jest.fn(() => false)
      processor.dispatchToHandler = jest.fn()
      const response = await processor.execute(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(response).toBeNull()
      expect(processor.isRequestApplicable).toHaveBeenCalledTimes(1)
      expect(processor.isRequestApplicable).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER)
    })

    it('should call the `dispatchToHandler` method when the request is applicable', async () => {
      processor.isRequestApplicable = jest.fn(() => true)
      processor.dispatchToHandler = jest.fn()
      await processor.execute(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(processor.dispatchToHandler).toHaveBeenCalledTimes(1)
      expect(processor.dispatchToHandler).toHaveBeenCalledWith(
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS
      )
    })
  })

  describe('isRequestApplicable', () => {
    it('should return false when `action` is not defined', () => {
      const payload = _.assign({}, VALID_PAYLOAD_AS_CUSTOMER)
      delete payload.action

      expect(processor.isRequestApplicable(payload)).toBe(false)
    })

    it("should return false when `action` is not 'Create'", () => {
      expect(
        processor.isRequestApplicable(_.merge({}, VALID_PAYLOAD_AS_CUSTOMER, { action: '' }))
      ).toBe(false)

      expect(
        processor.isRequestApplicable(_.merge({}, VALID_PAYLOAD_AS_CUSTOMER, { action: 'Created' }))
      ).toBe(false)
    })

    it('should return false when `resource.typeId` is not defined', () => {
      const payload = _.cloneDeep(VALID_PAYLOAD_AS_CUSTOMER)
      delete payload.resource.typeId
      expect(processor.isRequestApplicable(payload)).toBe(false)
    })

    it("should return false when `resource.typeId` is not 'payment'", () => {
      expect(
        processor.isRequestApplicable(
          _.merge({}, VALID_PAYLOAD_AS_CUSTOMER, { resource: { typeId: '' } })
        )
      ).toBe(false)

      expect(
        processor.isRequestApplicable(
          _.merge({}, VALID_PAYLOAD_AS_CUSTOMER, { resource: { typeId: 'customer' } })
        )
      ).toBe(false)
    })

    it("should return false when the payment interface is is not 'worldpay'", () => {
      expect(
        processor.isRequestApplicable(
          _.merge({}, VALID_PAYLOAD_AS_CUSTOMER, {
            resource: { obj: { paymentMethodInfo: { paymentInterface: 'test' } } },
          })
        )
      ).toBe(false)

      let config = _.merge({}, VALID_PAYLOAD_AS_CUSTOMER)
      delete config.resource
      expect(processor.isRequestApplicable(config)).toBe(false)
    })

    it("should return false when the payment method is is not 'card'", () => {
      expect(
        processor.isRequestApplicable(
          _.merge({}, VALID_PAYLOAD_AS_CUSTOMER, {
            resource: { obj: { paymentMethodInfo: { method: 'test' } } },
          })
        )
      ).toBe(false)

      let config = _.cloneDeep(VALID_PAYLOAD_AS_CUSTOMER)
      delete config.resource.obj.paymentMethodInfo.method
      expect(processor.isRequestApplicable(config)).toBe(false)
    })

    it('should return true when the payload is applicable', () => {
      expect(processor.isRequestApplicable(VALID_PAYLOAD_AS_CUSTOMER)).toBe(true)
    })
  })

  describe('dispatchToHandler', () => {
    it('should call the `process` method on an instance of `PaymentRequestHandler`', async () => {
      const processSpy = jest.spyOn(PaymentRequestHandler.prototype, 'process')
      processSpy.mockReturnValue('dummyResponse')
      await processor.dispatchToHandler(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(processSpy).toHaveBeenCalledTimes(1)
      expect(processSpy).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      processSpy.mockRestore()
    })
  })

  describe('getWorldpayEndpoint', () => {
    it("should return the test endpoint when the `env` option is set to 'test'", () => {
      expect(processor.getWorldpayEndpoint()).toBe(
        'https://secure-test.worldpay.com/jsp/merchant/xml/paymentService.jsp'
      )
    })

    it("should return the production endpoint when the `env` option is set to 'production'", () => {
      const processor = new PaymentProcessor(commercetoolsClient, {
        ...VALID_OPTIONS,
        env: 'production',
      })
      expect(processor.getWorldpayEndpoint()).toBe(
        'https://secure.worldpay.com/jsp/merchant/xml/paymentService.jsp'
      )
    })
  })
})
