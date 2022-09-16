'use strict'

const _ = require('lodash')
const CommercetoolsClient = require('../../../src/commercetools/Client')
const PaymentProcessor = require('../../../src/processor/payment/PaymentProcessor')
const PaymentRequestHandler = require('../../../src/processor/payment/PaymentRequestHandler')

const VALID_OPTIONS = {
  merchantCode: 'dummyMerchantCode',
  installationId: 'dummyInstallationId',
  xmlUsername: 'dummyXmlUsername',
  xmlPassword: 'dummyXmlPassword',
  macSecret: 'dummyMacSecret',
  timeout: 2000,
  env: 'test',
  termsURL: 'https://www.mysafeshop.com/tnc',
  returnURL: 'https://www.mysafeshop.com/checkout',
}

const VALID_PAYLOAD_AS_CUSTOMER = require('./data/validPayloadAsCustomer')
const { ApplePaySessionRequestHandler } = require('../../../src/processor/payment/ApplePaySessionRequestHandler')
const {
  WorldpayCommunicationRequestHandler,
} = require('../../../src/processor/payment/WorldpayCommunicationRequestHandler')
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
        new Error('`commercetoolsClient` parameter must be of type CommercetoolsClient'),
      )

      expect(() => new PaymentProcessor('test', VALID_OPTIONS)).toThrow(
        new Error('`commercetoolsClient` parameter must be of type CommercetoolsClient'),
      )

      expect(() => new PaymentProcessor({}, VALID_OPTIONS)).toThrow(
        new Error('`commercetoolsClient` parameter must be of type CommercetoolsClient'),
      )
    })

    it('should throw an Error when any expected options are missing', () => {
      expect(() => new PaymentProcessor(commercetoolsClient)).toThrow(
        new Error('`options` parameter is missing or empty'),
      )

      expect(() => new PaymentProcessor(commercetoolsClient, {})).toThrow(
        new Error('`options` parameter is missing or empty'),
      )

      expect(() => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['merchantCode']))).toThrow(
        new Error('`options` parameter is missing required properties: merchantCode'),
      )

      expect(() => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['installationId']))).toThrow(
        new Error('`options` parameter is missing required properties: installationId'),
      )

      expect(() => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['xmlUsername']))).toThrow(
        new Error('`options` parameter is missing required properties: xmlUsername'),
      )

      expect(() => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['xmlPassword']))).toThrow(
        new Error('`options` parameter is missing required properties: xmlPassword'),
      )

      expect(() => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['macSecret']))).toThrow(
        new Error('`options` parameter is missing required properties: macSecret'),
      )

      expect(() => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['env']))).toThrow(
        new Error('`options` parameter is missing required properties: env'),
      )

      expect(
        () => new PaymentProcessor(commercetoolsClient, _.omit(VALID_OPTIONS, ['macSecret', 'installationId'])),
      ).toThrow(new Error('`options` parameter is missing required properties: installationId, macSecret'))
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
    let applePayHandlerRequestApplicableSpy
    let worldpayHandlerRequestApplicableSpy
    let applePayHandlerProcessSpy
    let worldpayHandlerProcessSpy

    beforeEach(() => {
      applePayHandlerRequestApplicableSpy = jest.spyOn(ApplePaySessionRequestHandler.prototype, 'isRequestApplicable')
      applePayHandlerProcessSpy = jest.spyOn(ApplePaySessionRequestHandler.prototype, 'process')
      worldpayHandlerRequestApplicableSpy = jest.spyOn(
        WorldpayCommunicationRequestHandler.prototype,
        'isRequestApplicable',
      )
      worldpayHandlerProcessSpy = jest.spyOn(WorldpayCommunicationRequestHandler.prototype, 'process')
    })

    afterEach(() => {
      applePayHandlerRequestApplicableSpy.mockRestore()
      applePayHandlerProcessSpy.mockRestore()
      worldpayHandlerRequestApplicableSpy.mockRestore()
      worldpayHandlerProcessSpy.mockRestore()
    })

    it('should default `headers` param to an empty object', async () => {
      applePayHandlerRequestApplicableSpy.mockReturnValue(true)
      worldpayHandlerRequestApplicableSpy.mockReturnValue(false)
      applePayHandlerProcessSpy.mockReturnValue('dummyResponse')
      const response = await processor.execute(VALID_PAYLOAD_AS_CUSTOMER)
      expect(response).toEqual(['dummyResponse'])
      expect(applePayHandlerProcessSpy).toHaveBeenCalledTimes(1)
      expect(worldpayHandlerProcessSpy).toHaveBeenCalledTimes(0)
      expect(applePayHandlerProcessSpy).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER, {})
    })

    it('should call the `isRequestApplicable` method to check if the request should be processed', async () => {
      applePayHandlerRequestApplicableSpy.mockReturnValue(false)
      worldpayHandlerRequestApplicableSpy.mockReturnValue(false)
      const response = await processor.execute(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(response).toEqual([])
      expect(applePayHandlerRequestApplicableSpy).toHaveBeenCalledTimes(1)
      expect(worldpayHandlerRequestApplicableSpy).toHaveBeenCalledTimes(1)
      expect(applePayHandlerProcessSpy).toHaveBeenCalledTimes(0)
      expect(worldpayHandlerProcessSpy).toHaveBeenCalledTimes(0)
    })

    it('should call the `process` method when the request is applicable', async () => {
      applePayHandlerRequestApplicableSpy.mockReturnValue(true)
      worldpayHandlerRequestApplicableSpy.mockReturnValue(true)
      applePayHandlerProcessSpy.mockReturnValue('a')
      worldpayHandlerProcessSpy.mockReturnValue('b')
      const response = await processor.execute(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(response).toEqual(['b', 'a'])
      expect(applePayHandlerProcessSpy).toHaveBeenCalledTimes(1)
      expect(applePayHandlerProcessSpy).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(worldpayHandlerProcessSpy).toHaveBeenCalledTimes(1)
      expect(worldpayHandlerProcessSpy).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
    })
  })

  describe('process', () => {
    it('should call the `process` method on an instance of `PaymentRequestHandler`', async () => {
      const processSpy = jest.spyOn(PaymentRequestHandler.prototype, 'process')
      processSpy.mockReturnValue('dummyResponse')
      await new WorldpayCommunicationRequestHandler(commercetoolsClient, VALID_OPTIONS, VALID_PROJECT_DATA).process(
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS,
      )
      expect(processSpy).toHaveBeenCalledTimes(1)
      expect(processSpy).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      processSpy.mockRestore()
    })
  })

  describe('getWorldpayEndpoint', () => {
    it("should return the test endpoint when the `env` option is set to 'test'", () => {
      expect(processor.getWorldpayEndpoint()).toBe(
        'https://secure-test.worldpay.com/jsp/merchant/xml/paymentService.jsp',
      )
    })

    it("should return the production endpoint when the `env` option is set to 'production'", () => {
      const processor = new PaymentProcessor(commercetoolsClient, {
        ...VALID_OPTIONS,
        env: 'production',
      })
      expect(processor.getWorldpayEndpoint()).toBe('https://secure.worldpay.com/jsp/merchant/xml/paymentService.jsp')
    })
  })
})
