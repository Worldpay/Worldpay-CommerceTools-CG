'use strict'

const _ = require('lodash')

const VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION = require('./data/validPayloadAsCustomerWithApplePaySession')
const VALID_PAYLOAD_AS_CUSTOMER_WITH_TOKENISED_CARD = require('./data/validPayloadAsCustomerWithTokenisedCard')
const { ApplePaySessionRequestHandler } = require('../../../src/processor/payment/ApplePaySessionRequestHandler')
const PaymentProcessorException = require('../../../src/processor/payment/PaymentProcessorException')
const { codes: errorCodes } = require('../../../src/processor/payment/errors')

const VALID_HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36',
  accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9\n' +
    'accept-encoding: gzip, deflate, br\n',
}

describe('ApplePaySessionRequestHandler', () => {
  let handler

  beforeEach(() => {
    handler = new ApplePaySessionRequestHandler()
  })

  describe('isRequestApplicable', () => {
    it('should return false when `action` is not defined', () => {
      const payload = _.assign({}, VALID_PAYLOAD_AS_CUSTOMER_WITH_TOKENISED_CARD)
      delete payload.action

      expect(handler.isRequestApplicable(payload)).toBe(false)
    })

    it("should return false when `action` is not 'Create'", () => {
      expect(
        handler.isRequestApplicable(_.merge({}, VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION, { action: '' })),
      ).toBe(false)
    })

    it('should return false when `resource.typeId` is not defined', () => {
      const payload = _.cloneDeep(VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION)
      delete payload.resource.typeId
      expect(handler.isRequestApplicable(payload)).toBe(false)
    })

    it("should return false when `resource.typeId` is not 'payment'", () => {
      expect(
        handler.isRequestApplicable(
          _.merge({}, VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION, { resource: { typeId: '' } }),
        ),
      ).toBe(false)

      expect(
        handler.isRequestApplicable(
          _.merge({}, VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION, { resource: { typeId: 'customer' } }),
        ),
      ).toBe(false)
    })

    it("should return false when the payment interface is not 'worldpay'", () => {
      expect(
        handler.isRequestApplicable(
          _.merge({}, VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION, {
            resource: { obj: { paymentMethodInfo: { paymentInterface: 'test' } } },
          }),
        ),
      ).toBe(false)

      let config = _.merge({}, VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION)
      delete config.resource
      expect(handler.isRequestApplicable(config)).toBe(false)
    })

    it("should return false when the payment method is not 'card'", () => {
      expect(
        handler.isRequestApplicable(
          _.merge({}, VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION, {
            resource: { obj: { paymentMethodInfo: { method: 'test' } } },
          }),
        ),
      ).toBe(false)

      let config = _.cloneDeep(VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION)
      delete config.resource.obj.paymentMethodInfo.method
      expect(handler.isRequestApplicable(config)).toBe(false)
    })

    it('should return true when the payload is applicable', () => {
      expect(handler.isRequestApplicable(VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION)).toBe(true)
    })
  })

  describe('process', () => {
    it('should call add actions for the interaction and replacement of paymentData in case of success', async () => {
      const prev = handler.createSession
      // eslint-disable-next-line no-unused-vars
      handler.createSession = jest.fn((validationURL) => ({
        status: 200,
        data: {
          epochTimestamp: 1649934091855,
          expiresAt: 1649937691855,
          nonce: 'e547df5e',
          merchantIdentifier: 'A9A585F8800',
          displayName: 'Sunrise Worldpay Shop',
          signature: '308006092a864886f7',
          operationalAnalyticsIdentifier: 'Sunrise Worldpay Shop:A9A5',
          retries: 0,
          pspId: 'A9A585F8800',
        },
      }))
      const result = await handler.process(VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION, VALID_HEADERS)
      expect(result).toMatchObject([
        {
          action: 'addInterfaceInteraction',
          fields: {
            request:
              '{"isTrusted":true,"method":"applePay","validationURL":"https://apple-pay-gateway.apple.com/paymentservices/startSession","ip":"0.0.0.0"}',
            response:
              '{"epochTimestamp":1649934091855,"expiresAt":1649937691855,"nonce":"e547df5e","merchantIdentifier":"A9A585F8800","displayName":"Sunrise Worldpay Shop","signature":"308006092a864886f7","operationalAnalyticsIdentifier":"Sunrise Worldpay Shop:A9A5","retries":0,"pspId":"A9A585F8800"}',
          },
          type: {
            key: 'worldpay-payment-interface-interaction',
          },
        },
        {
          action: 'setCustomField',
          name: 'paymentData',
          value:
            '{"epochTimestamp":1649934091855,"expiresAt":1649937691855,"nonce":"e547df5e","merchantIdentifier":"A9A585F8800","displayName":"Sunrise Worldpay Shop","signature":"308006092a864886f7","operationalAnalyticsIdentifier":"Sunrise Worldpay Shop:A9A5","retries":0,"pspId":"A9A585F8800"}',
        },
      ])
      handler.createSession = prev
    })

    it('should respond with actions to log errors', async () => {
      const prev = handler.createSession
      handler.createSession = jest.fn((validationURL) => ({
        status: 500,
        data: { all: `Apple is down for ${validationURL}` },
      }))
      const result = await handler.process(VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION, VALID_HEADERS)
      expect(result).toMatchObject([
        {
          action: 'addInterfaceInteraction',
          fields: {
            request:
              '{"isTrusted":true,"method":"applePay","validationURL":"https://apple-pay-gateway.apple.com/paymentservices/startSession","ip":"0.0.0.0"}',
            response: '{"all":"Apple is down for https://apple-pay-gateway.apple.com/paymentservices/startSession"}',
          },
          type: {
            key: 'worldpay-payment-interface-interaction',
          },
        },
        { action: 'setCustomField', name: 'paymentData', value: '{"error":"Failed to set up Apple Pay session"}' },
      ])
      handler.createSession = prev
    })

    it('should respond with one actions in case of an exception', async () => {
      const prev = handler.createSession
      // eslint-disable-next-line no-unused-vars
      handler.createSession = jest.fn((validationURL) => {
        throw new PaymentProcessorException([{ code: errorCodes.APPLE_PAY_SESSION_FAILED }])
      })
      const result = await handler.process(VALID_PAYLOAD_AS_CUSTOMER_WITH_APPLE_PAY_SESSION, VALID_HEADERS)
      expect(result).toMatchObject([
        { action: 'setCustomField', name: 'paymentData', value: '{"error":"Failed to set up Apple Pay session"}' },
      ])
      handler.createSession = prev
    })
  })
})
