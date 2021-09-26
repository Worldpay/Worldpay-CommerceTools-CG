'use strict'

const DefaultProcessHandler = require('../../../lib/processor/notification/DefaultProcessHandler')
const CommercetoolsClient = require('../../../lib/commercetools/Client')
const WorldpayNotification = require('../../../lib/worldpay/WorldpayNotification')

const VALID_NOTIFICATION_XML = require('./data/notification')
// eslint-disable-next-line
const VALID_NOTIFICATION_OBJ = new WorldpayNotification(VALID_NOTIFICATION_XML)

describe('DefaultProcessHandler', () => {
  let commercetoolsClient
  let handler

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

    handler = new DefaultProcessHandler(commercetoolsClient, { test: 1 })
  })

  describe('constructor', () => {
    it('should store the `commercetoolsClient` and `options` parameters in instance properties', () => {
      expect(handler.options).toEqual({ test: 1 })
      expect(handler.commercetoolsClient).toBeInstanceOf(CommercetoolsClient)
    })
  })

  describe('execute', () => {})
})
