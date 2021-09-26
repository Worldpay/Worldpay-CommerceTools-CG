'use strict'

const NotificationProcessor = require('../../../lib/processor/notification/NotificationProcessor')
const NotificationRequestHandler = require('../../../lib/processor/notification/NotificationRequestHandler')
const CommercetoolsClient = require('../../../lib/commercetools/Client')

jest.mock('../../../lib/processor/notification/NotificationRequestHandler')

describe('NotificationProcessor', () => {
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

    processor = new NotificationProcessor(commercetoolsClient, {})
  })

  describe('constructor', () => {
    it('should throw an Error type exception when the `commercetoolsClient` parameter is invalid', () => {
      expect(() => new NotificationProcessor(null, {})).toThrow(
        new Error('`commercetoolsClient` parameter must be of type CommercetoolsClient')
      )

      expect(() => new NotificationProcessor('test', {})).toThrow(
        new Error('`commercetoolsClient` parameter must be of type CommercetoolsClient')
      )

      expect(() => new NotificationProcessor({}, {})).toThrow(
        new Error('`commercetoolsClient` parameter must be of type CommercetoolsClient')
      )

      expect(() => new NotificationProcessor(commercetoolsClient, 'test')).toThrow(
        new Error('`options` parameter must be an object')
      )

      expect(() => new NotificationProcessor(commercetoolsClient)).not.toThrow()
    })
  })

  describe('execute', () => {
    it('should return the response from the `NotificationRequestHandler.execute call`', () => {
      NotificationRequestHandler.prototype.process.mockReturnValue('dummyResponse')
      const result = processor.execute({ myPayload: 'test' })
      expect(NotificationRequestHandler.prototype.process).toHaveBeenCalledTimes(1)
      expect(NotificationRequestHandler.prototype.process).toHaveBeenCalledWith({
        myPayload: 'test',
      })
      expect(result).toBe('dummyResponse')
    })
  })
})
