'use strict'

const fs = require('fs')
const axios = require('axios')
const CommercetoolsClient = require('../../../lib/commercetools/Client')
const PaymentRequestHandler = require('../../../lib/processor/payment/PaymentRequestHandler')
const PaymentProcessorException = require('../../../lib/processor/payment/PaymentProcessorException')
const PaymentOrderBuilder = require('../../../lib/processor/payment/PaymentOrderBuilder')
const { codes: errorCodes } = require('../../../lib/processor/payment/errors')
const xmlBuilder = require('../../../lib/worldpay/xmlBuilder')

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
const VALID_PAYLOAD_AS_ANONYMOUS = require('./data/validPayloadAsAnonymous')
const VALID_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
  accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\n' +
    'accept-encoding: gzip, deflate, br\n',
}
const VALID_CUSTOMER_CART = require('./data/validCustomerCart')
const VALID_CUSTOMER = require('./data/validCustomer')
const VALID_PROJECT_DATA = {
  key: 'testProjectKey',
  version: '1.2.3',
}

describe('PaymentRequestHandler', () => {
  let commercetoolsClient
  let handler
  let makeRequestSpy

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

    handler = new PaymentRequestHandler(
      commercetoolsClient,
      VALID_OPTIONS,
      VALID_PROJECT_DATA,
      new PaymentOrderBuilder(VALID_OPTIONS, VALID_PROJECT_DATA)
    )
    // We spyOn/mock this method to ensure that we don't try and communicate with Worldpay
    makeRequestSpy = jest.spyOn(handler, 'makeRequest')
    makeRequestSpy.mockReturnValue({})
  })

  describe('constructor', () => {
    it('should set the correct class properties', () => {
      expect(handler.commercetoolsClient).toBeInstanceOf(CommercetoolsClient)
      expect(handler.options).toEqual(VALID_OPTIONS)
      expect(handler.project).toEqual(VALID_PROJECT_DATA)
      expect(handler.orderBuilder).toBeInstanceOf(PaymentOrderBuilder)
    })

    it('should provide a default implementation for the `orderBuilder` parameter', () => {
      const handler = new PaymentRequestHandler(
        commercetoolsClient,
        VALID_OPTIONS,
        VALID_PROJECT_DATA
      )
      expect(handler.commercetoolsClient).toBeInstanceOf(CommercetoolsClient)
      expect(handler.options).toEqual(VALID_OPTIONS)
      expect(handler.project).toEqual(VALID_PROJECT_DATA)
      expect(handler.orderBuilder).toBeInstanceOf(PaymentOrderBuilder)
    })
  })

  describe('process', () => {
    beforeEach(() => {
      handler.getCart = jest.fn(() => VALID_CUSTOMER_CART)
      handler.getCustomer = jest.fn(() => VALID_CUSTOMER)
      handler.sendWorldpayXml = jest.fn(() => ({
        xmlMessage: '<xml>An XML string</xml>',
        response: {
          data: '<xml>Dummy XML response</xml>',
        },
      }))
      handler.buildCommercetoolsActions = jest.fn(() => [{ action: 'dummyAction' }])
    })

    it('should get the active cart and store it as a property on the class', async () => {
      await handler.process(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(handler.getCart).toHaveBeenCalledTimes(1)
      expect(handler.getCart).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER)
      expect(handler.cart).toEqual(VALID_CUSTOMER_CART)
    })

    it('should set the customer profile on the class when there is a customer id in the payload', async () => {
      await handler.process(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(handler.getCustomer).toHaveBeenCalledTimes(1)
      expect(handler.getCustomer).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER)
      expect(handler.customer).toEqual(VALID_CUSTOMER)
    })

    it('should set the customer profile on the class to null when there is no customer id', async () => {
      handler.getCustomer = jest.fn(() => null)
      await handler.process(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(handler.getCustomer).toHaveBeenCalledTimes(1)
      expect(handler.getCustomer).toHaveBeenCalledWith(VALID_PAYLOAD_AS_CUSTOMER)
      expect(handler.customer).toBeNull()
    })

    it('should call the `sendWorldpayXml` method with the correct parameters', async () => {
      await handler.process(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(handler.sendWorldpayXml).toHaveBeenCalledTimes(1)
      expect(handler.sendWorldpayXml).toHaveBeenCalledWith(
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER,
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS
      )
    })

    it('should call the `buildCommercetoolsActions` method with the correct parameters', async () => {
      await handler.process(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(handler.buildCommercetoolsActions).toHaveBeenCalledTimes(1)
      expect(handler.buildCommercetoolsActions).toHaveBeenCalledWith(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        '<xml>An XML string</xml>',
        {
          data: '<xml>Dummy XML response</xml>',
        }
      )
    })

    it('should return the stringified output of `buildCommercetoolsActions`, wrapped in an object with an `actions` property', async () => {
      const response = await handler.process(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(response).toEqual(
        JSON.stringify({
          actions: [{ action: 'dummyAction' }],
        })
      )
    })
  })

  describe('getCart', () => {
    it('should call `getCartById` on the commercetools client', async () => {
      commercetoolsClient.getCartById = jest.fn().mockResolvedValue({ dummyCart: 1 })
      await handler.getCart(VALID_PAYLOAD_AS_CUSTOMER)
      expect(commercetoolsClient.getCartById).toHaveBeenCalledTimes(1)
      expect(commercetoolsClient.getCartById).toHaveBeenCalledWith(
        VALID_PAYLOAD_AS_CUSTOMER.resource.obj.custom.fields.cartId
      )
    })

    it('should throw an exception if the cart does not exist', async () => {
      commercetoolsClient.getCartById = jest.fn().mockResolvedValue(null)
      await expect(handler.getCart(VALID_PAYLOAD_AS_CUSTOMER)).rejects.toEqual(
        new PaymentProcessorException([
          {
            code: errorCodes.NO_CART,
            info: { cartId: VALID_PAYLOAD_AS_CUSTOMER.resource.obj.custom.fields.cartId },
          },
        ])
      )
      expect(commercetoolsClient.getCartById).toHaveBeenCalledTimes(1)
      expect(commercetoolsClient.getCartById).toHaveBeenCalledWith(
        VALID_PAYLOAD_AS_CUSTOMER.resource.obj.custom.fields.cartId
      )
    })

    it('should return the value returned from the `getCartById` method on the commercetools client', async () => {
      commercetoolsClient.getCartById = jest.fn().mockResolvedValue({ dummyCart: 1 })
      const response = await handler.getCart(VALID_PAYLOAD_AS_CUSTOMER)
      expect(response).toEqual({ dummyCart: 1 })
    })
  })

  describe('getCustomer', () => {
    it('should return null if there is not a customer id in the payload', async () => {
      commercetoolsClient.getCustomerById = jest.fn().mockReturnValue({ dummyCustomer: 1 })
      const response = await handler.getCustomer(VALID_PAYLOAD_AS_ANONYMOUS)
      expect(response).toBeNull()
      expect(commercetoolsClient.getCustomerById).toHaveBeenCalledTimes(0)
    })

    it('should call `getCustomerById` on the commercetools client if a customer id is in the payload', async () => {
      commercetoolsClient.getCustomerById = jest.fn().mockReturnValue(VALID_CUSTOMER)
      const response = await handler.getCustomer(VALID_PAYLOAD_AS_CUSTOMER)
      expect(response).toEqual(VALID_CUSTOMER)
      expect(commercetoolsClient.getCustomerById).toHaveBeenCalledTimes(1)
      expect(commercetoolsClient.getCustomerById).toHaveBeenCalledWith(
        VALID_PAYLOAD_AS_CUSTOMER.resource.obj.customer.id
      )
    })

    it('should throw an exception if a customer does not exist for the given customer id', async () => {
      commercetoolsClient.getCustomerById = jest.fn().mockReturnValue(null)
      await expect(handler.getCustomer(VALID_PAYLOAD_AS_CUSTOMER)).rejects.toEqual(
        new PaymentProcessorException([
          {
            code: errorCodes.NO_SUCH_CUSTOMER,
            info: { customerId: VALID_PAYLOAD_AS_CUSTOMER.resource.obj.customer.id },
          },
        ])
      )
    })

    it('should return the customer cart if one exists', async () => {
      commercetoolsClient.getCustomerById = jest.fn().mockReturnValue(VALID_CUSTOMER)
      const customer = await handler.getCustomer(VALID_PAYLOAD_AS_CUSTOMER)
      expect(customer).toEqual(VALID_CUSTOMER)
    })
  })

  describe('sendWorldpayXml', () => {
    beforeEach(() => {
      handler.buildXmlMessage = jest.fn(() => '<xml>An XML string</xml>')
      handler.postMessageToWorldpay = jest.fn(() => ({
        status: 200,
        data: 'dummyResponseData',
        test: 'test',
        headers: {
          'content-type': 'text/xml',
        },
        isError: false,
      }))
    })

    it('should call `buildXmlMessage` with the correct parameters', async () => {
      await handler.sendWorldpayXml(
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER,
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS
      )
      expect(handler.buildXmlMessage).toHaveBeenCalledTimes(1)
      expect(handler.buildXmlMessage).toHaveBeenCalledWith(
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER,
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS
      )
    })

    it('should call `postMessageToWorldpay` with the response of `buildXmlMessage`', async () => {
      await handler.sendWorldpayXml(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(handler.postMessageToWorldpay).toHaveBeenCalledTimes(1)
      expect(handler.postMessageToWorldpay).toHaveBeenCalledWith('<xml>An XML string</xml>')
    })

    it('should return an object containing the xml message sent to worldpay along with the response', async () => {
      const response = await handler.sendWorldpayXml(VALID_PAYLOAD_AS_CUSTOMER, VALID_HEADERS)
      expect(response).toEqual({
        xmlMessage: '<xml>An XML string</xml>',
        response: {
          status: 200,
          data: 'dummyResponseData',
          headers: {
            'content-type': 'text/xml',
          },
          isError: false,
        },
      })
    })
  })

  describe('buildXmlMessage', () => {
    it('should return the response from a call to `xmlBuilder.buildWorldpayXml`', () => {
      const buildWorldpayXmlSpy = jest.spyOn(xmlBuilder, 'buildWorldpayXml')
      buildWorldpayXmlSpy.mockReturnValue('returnData')
      handler.orderBuilder.build = jest.fn(() => 'builtData')
      const result = handler.buildXmlMessage(
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER,
        VALID_PAYLOAD_AS_CUSTOMER,
        VALID_HEADERS
      )
      expect(result).toBe('returnData')
      expect(handler.orderBuilder.build).toHaveBeenCalledTimes(1)
      expect(handler.orderBuilder.build).toHaveBeenCalledWith(
        VALID_CUSTOMER_CART,
        VALID_CUSTOMER,
        VALID_PAYLOAD_AS_CUSTOMER,
        {
          userAgent: VALID_HEADERS['user-agent'],
          accept: VALID_HEADERS.accept,
        }
      )
      expect(buildWorldpayXmlSpy).toHaveBeenCalledTimes(1)
      expect(buildWorldpayXmlSpy).toHaveBeenCalledWith('builtData')
      buildWorldpayXmlSpy.mockRestore()
    })
  })

  describe('postMessageToWorldpay', () => {
    beforeEach(() => {
      handler.getWorldpayEndpoint = jest.fn(() => 'https://www.worldpayendpointtest.com/')
      handler.makeRequest = jest.fn(() => 'testData')
    })

    it('should call `makeRequest` with the expected parameters', async () => {
      handler.options.endpoint = 'https://www.worldpayendpointtest.com/'
      await handler.postMessageToWorldpay('<xml>An XML string</xml>')
      expect(handler.makeRequest).toHaveBeenCalledTimes(1)
      expect(handler.makeRequest.mock.calls[0].length).toBe(3)
      expect(handler.makeRequest.mock.calls[0][0]).toBe('https://www.worldpayendpointtest.com/')
      expect(handler.makeRequest.mock.calls[0][1]).toBe('<xml>An XML string</xml>')
      expect(handler.makeRequest.mock.calls[0][2]).toMatchObject({
        auth: {
          username: 'dummyXmlUsername',
          password: 'dummyXmlPassword',
        },
        headers: {
          'Content-Type': 'text/xml',
        },
        timeout: 2000,
      })
      expect(handler.makeRequest.mock.calls[0][2].validateStatus).toBeInstanceOf(Function)
      expect(handler.makeRequest.mock.calls[0][2].validateStatus(200)).toBe(true)
      expect(handler.makeRequest.mock.calls[0][2].validateStatus(201)).toBe(false)
      expect(handler.makeRequest.mock.calls[0][2].validateStatus(500)).toBe(false)
    })

    it('should return the output of `makeRequest` when successful', async () => {
      const response = await handler.postMessageToWorldpay('<xml>An XML string</xml>')
      expect(response).toBe('testData')
    })

    it('should an object with the exception data and an `isError` flag when the request fails', async () => {
      handler.makeRequest = jest.fn(() => {
        throw {
          toJSON: () => ({
            errorMessage: 'dummy error message',
          }),
        }
      })
      const response = await handler.postMessageToWorldpay('<xml>An XML string</xml>')
      expect(response).toEqual({
        data: {
          errorMessage: 'dummy error message',
        },
        isError: true,
      })
    })
  })

  describe('buildCommercetoolsActions', () => {
    beforeEach(() => {
      handler.getAddInterfaceInteractionAction = jest.fn(() => ({
        action: 'addInterface',
        value: 'addInterfaceDummyValue',
      }))
      handler.extractXmlData = jest.fn(() => ({
        orderCode: 'dummyOrderCode',
        redirectUrl: 'dummyRedirectUrl',
        referenceId: 'dummyReferenceId',
      }))
      handler.getSetCustomFieldAction = jest.fn(() => ({
        action: 'setCustomField',
        value: 'setCustomFieldDummyValue',
      }))
      handler.getSetInterfaceIdAction = jest.fn(() => ({
        action: 'setInterfaceId',
        value: 'setInterfaceIdDummyValue',
      }))
      handler.getSetMethodInfoNameAction = jest.fn(() => ({
        action: 'setMethodInfoName',
        value: 'setMethodInfoNameDummyValue',
      }))
      handler.getSetStatusInterfaceCodeAction = jest.fn(() => ({
        action: 'setStatusInterfaceCode',
        value: 'setStatusInterfaceCodeDummyValue',
      }))
      handler.getAddTransactionAction = jest.fn(() => ({
        action: 'addTransaction',
        value: 'addTransactionDummyValue',
      }))
      handler.getSetCustomTypeAction = jest.fn(() => ({
        action: 'setCustomType',
        type: {
          key: 'worldpay-payment',
        },
        fields: {},
      }))
    })

    it('should return only the actions from `getAddInterfaceInteractionAction` if the response has an error', () => {
      const xmlMessage = '<xml>dummy xml string</xml>'
      const worldpayResponse = {
        isError: true,
      }
      const response = handler.buildCommercetoolsActions(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        xmlMessage,
        worldpayResponse
      )
      expect(handler.getAddInterfaceInteractionAction).toHaveBeenCalledTimes(1)
      expect(handler.getAddInterfaceInteractionAction).toHaveBeenCalledWith(
        xmlMessage,
        worldpayResponse
      )
      expect(response).toEqual([
        {
          action: 'addInterface',
          value: 'addInterfaceDummyValue',
        },
      ])
    })

    it('should call `extractXmlData` when the response does not have an error', () => {
      const xmlMessage = '<xml>dummy xml string</xml>'
      const worldpayResponse = {
        isError: false,
      }
      handler.extractXmlData = jest.fn(() => false)
      handler.buildCommercetoolsActions(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        xmlMessage,
        worldpayResponse
      )
      expect(handler.extractXmlData).toHaveBeenCalledTimes(1)
      expect(handler.extractXmlData).toHaveBeenCalledWith(worldpayResponse, {
        orderCode: VALID_PAYLOAD_AS_CUSTOMER.resource.id,
        merchantCode: VALID_OPTIONS.merchantCode,
      })
    })

    it('should return only the actions from `getAddInterfaceInteractionAction` when `extractXmlData` returns false', () => {
      const xmlMessage = '<xml>dummy xml string</xml>'
      const worldpayResponse = {
        isError: false,
      }
      handler.extractXmlData = jest.fn(() => false)
      const response = handler.buildCommercetoolsActions(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        xmlMessage,
        worldpayResponse
      )
      expect(response).toEqual([
        {
          action: 'addInterface',
          value: 'addInterfaceDummyValue',
        },
      ])
    })

    it('should call all expected actions methods when response is valid and `extractXmlData` returns truthy', () => {
      const xmlMessage = '<xml>dummy xml string</xml>'
      const worldpayResponse = {
        isError: false,
      }
      handler.buildCommercetoolsActions(
        VALID_CUSTOMER_CART,
        VALID_PAYLOAD_AS_CUSTOMER,
        xmlMessage,
        worldpayResponse
      )

      expect(handler.getSetCustomFieldAction).toHaveBeenCalledWith(
        'merchantCode',
        'dummyMerchantCode'
      )
      expect(handler.getSetCustomFieldAction).toHaveBeenCalledWith(
        'worldpayOrderCode',
        'dummyOrderCode'
      )
      expect(handler.getSetCustomFieldAction).toHaveBeenCalledWith(
        'redirectUrl',
        'dummyRedirectUrl'
      )
      expect(handler.getSetCustomFieldAction).toHaveBeenCalledWith(
        'referenceId',
        'dummyReferenceId'
      )

      expect(handler.getSetCustomFieldAction).toHaveBeenCalledTimes(5)
      expect(handler.getSetCustomFieldAction).toHaveBeenCalledWith(
        'installationId',
        'dummyInstallationId'
      )
      expect(handler.getSetInterfaceIdAction).toHaveBeenCalledTimes(1)
      expect(handler.getSetMethodInfoNameAction).toHaveBeenCalledTimes(1)
      expect(handler.getSetStatusInterfaceCodeAction).toHaveBeenCalledTimes(1)
      expect(handler.getAddTransactionAction).toHaveBeenCalledTimes(1)
      expect(handler.getAddTransactionAction).toHaveBeenCalledWith(VALID_CUSTOMER_CART.totalPrice)
    })
  })

  describe('extractXmlData', () => {
    let validXmlResponse
    let invalidXmlResponseMissingMerchantCode
    let invalidXmlResponseMissingReply

    beforeAll(() => {
      validXmlResponse = fs.readFileSync(`${__dirname}/data/validPaymentResponse1.xml`).toString()
      invalidXmlResponseMissingMerchantCode = fs
        .readFileSync(`${__dirname}/data/invalidPaymentResponseMissingMerchantCode.xml`)
        .toString()
      invalidXmlResponseMissingReply = fs
        .readFileSync(`${__dirname}/data/invalidPaymentResponseMissingReply.xml`)
        .toString()
    })

    it('should return false if the XML is invalid', () => {
      expect(
        handler.extractXmlData(
          { data: invalidXmlResponseMissingMerchantCode },
          {
            orderCode: 'ExampleOrder1',
            merchantCode: 'ExampleCode1',
          }
        )
      ).toBe(false)
    })

    it('should return false if the XML parser throws an error', () => {
      expect(
        handler.extractXmlData(
          { data: invalidXmlResponseMissingReply },
          {
            orderCode: 'ExampleOrder1',
            merchantCode: 'ExampleCode1',
          }
        )
      ).toBe(false)
    })

    it('should return false if there is a merchant code mismatch', () => {
      expect(
        handler.extractXmlData(
          { data: validXmlResponse },
          {
            orderCode: 'ExampleOrder1',
            merchantCode: 'WillNotMatch',
          }
        )
      ).toBe(false)
    })

    it('should return false if there is an order code mismatch', () => {
      expect(
        handler.extractXmlData(
          { data: validXmlResponse },
          {
            orderCode: 'WillNotMatch',
            merchantCode: 'ExampleCode1',
          }
        )
      ).toBe(false)
    })

    it('should return an object with the expected properties when the XML is valid', () => {
      expect(
        handler.extractXmlData(
          { data: validXmlResponse },
          {
            orderCode: 'ExampleOrder1',
            merchantCode: 'ExampleCode1',
          }
        )
      ).toEqual({
        orderCode: 'ExampleOrder1',
        redirectUrl:
          'https://payments-test.worldpay.com/app/hpp/integration/wpg/corporate?OrderKey=test-order-key&Ticket=1234-5678&source=https%3A%2F%2Fsecure-test.worldpay.com',
        referenceId: 'YourReference',
      })
    })
  })

  describe('getAddInterfaceInteractionAction', () => {
    it('should return the expected object', () => {
      const response = handler.getAddInterfaceInteractionAction('xmlRequestString', {
        data: 'xmlResponseString',
      })
      expect(response).toMatchObject({
        action: 'addInterfaceInteraction',
        type: {
          key: 'worldpay-payment-interface-interaction',
        },
        fields: {
          request: 'xmlRequestString',
          response: 'xmlResponseString',
        },
      })
      expect(Date.parse(response.fields.createdAt)).not.toBeNaN()
    })
  })

  describe('getSetCustomTypeAction', () => {
    it('should return the expected object', () => {
      expect(handler.getSetCustomTypeAction({ testName: 'testValue' })).toEqual({
        action: 'setCustomType',
        type: {
          key: 'worldpay-payment',
        },
        fields: {
          testName: 'testValue',
        },
      })
    })
  })

  describe('getSetCustomFieldAction', () => {
    it('should return the expected object', () => {
      expect(handler.getSetCustomFieldAction('testName', 'testValue')).toEqual({
        action: 'setCustomField',
        name: 'testName',
        value: 'testValue',
      })
    })
  })

  describe('getSetInterfaceIdAction', () => {
    it('should return the expected object', () => {
      expect(handler.getSetInterfaceIdAction('test')).toEqual({
        action: 'setInterfaceId',
        interfaceId: 'test',
      })
    })
  })

  describe('getSetMethodInfoNameAction', () => {
    it('should return the expected object', () => {
      expect(handler.getSetMethodInfoNameAction()).toEqual({
        action: 'setMethodInfoName',
        name: {
          en: 'card',
        },
      })
    })
  })

  describe('getSetStatusInterfaceCodeAction', () => {
    it('should return the expected object', () => {
      expect(handler.getSetStatusInterfaceCodeAction()).toEqual({
        action: 'setStatusInterfaceCode',
        interfaceCode: 'INITIAL',
      })
    })
  })

  describe('getAddTransactionAction', () => {
    it('should return the expected object', () => {
      jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01 13:25:12.546').getTime())
      expect(handler.getAddTransactionAction({ centAmount: 12345 })).toEqual({
        action: 'addTransaction',
        transaction: {
          type: 'Authorization',
          state: 'Initial',
          timestamp: '2020-01-01T13:25:12.546Z',
          amount: {
            centAmount: 12345,
          },
        },
      })

      expect(handler.getAddTransactionAction('test')).toEqual({
        action: 'addTransaction',
        transaction: {
          type: 'Authorization',
          state: 'Initial',
          timestamp: '2020-01-01T13:25:12.546Z',
          amount: 'test',
        },
      })
    })

    jest.useRealTimers()
  })

  describe('makeRequest', () => {
    it('should call `axios.post` with the same parameters as called with', async () => {
      const axiosPostSpy = jest.spyOn(axios, 'post')
      axiosPostSpy.mockReturnValue('testResponse')
      makeRequestSpy.mockRestore()
      const response = await handler.makeRequest('one', 'two', 'three')
      expect(response).toBe('testResponse')
      expect(axiosPostSpy).toHaveBeenCalledTimes(1)
      expect(axiosPostSpy).toHaveBeenCalledWith('one', 'two', 'three')
      axiosPostSpy.mockRestore()
    })
  })
})
