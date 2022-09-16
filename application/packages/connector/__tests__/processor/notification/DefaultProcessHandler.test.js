'use strict'

const DefaultProcessHandler = require('../../../src/processor/notification/DefaultProcessHandler')
const CommercetoolsClient = require('../../../src/commercetools/Client')
const WorldpayNotification = require('../../../src/worldpay/WorldpayNotification')

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

  describe('execute', () => {
    it('should store the token details for given customer', async () => {
      handler.commercetoolsClient.getCustomerById = jest.fn(() => ({}))
      handler.buildTokenisedCard = jest.fn(() => ({}))
      handler.commercetoolsClient.setCustomersActions = jest.fn(() => ({}))
      const notification = { token: { authenticatedShopperID: 123 } }

      await handler.applyTokenActions(notification)

      expect(commercetoolsClient.getCustomerById).toHaveBeenCalledTimes(1)
      expect(commercetoolsClient.getCustomerById).toHaveBeenCalledWith(123)

      expect(commercetoolsClient.setCustomersActions).toHaveBeenCalledTimes(1)
    })
  })

  describe('buildTokenisedCard', () => {
    it('should create an object with Tokenised card for direct Payment', async () => {
      const worldPayTokenCreatedNotification = {
        authenticatedShopperID: 123,
        tokenEventReference: 'tokenEventReference',
        tokenReason: 'tokenReason',
        tokenDetails: {
          paymentTokenID: 'tokenId',
          paymentTokenExpiry: {
            date: {
              '@year': '1985',
              '@month': 8,
              '@dayOfMonth': 17,
            },
          },
        },
        paymentInstrument: {
          cardDetails: {
            derived: {
              cardBrand: 'cardBrand',
              cardSubBrand: 'CardSubBrand',
              issuerCountryCode: 'issuerCountry',
              obfuscatedPAN: 'obfuscatedPAN',
              bin: 'bin',
            },
          },
        },
      }

      expect(handler.buildTokenisedCard(worldPayTokenCreatedNotification)).toEqual({
        paymentTokenId: 'tokenId',
        tokenEventReference: 'tokenEventReference',
        tokenReason: 'tokenReason',
        paymentTokenExpiry: new Date(1985, 7, 17),
        cardBrand: 'cardBrand',
        cardSubBrand: 'CardSubBrand',
        issuerCountryCode: 'issuerCountry',
        obfuscatedPAN: 'obfuscatedPAN',
        bin: 'bin',
      })
    })
  })

  describe('build the actions to store tokenised cards on the customer profile', () => {
    it('should create an object with actions to store Tokenised card', async () => {
      const tokenisedCards = JSON.stringify({
        paymentTokenId: 'tokenId',
      })

      expect(handler.generateSetTokenisedCardsActions(tokenisedCards)).toEqual([
        {
          action: 'setCustomType',
          type: {
            key: 'customer-tokenised-cards',
          },
          fields: {
            tokenisedCards: tokenisedCards,
          },
        },
      ])
    })

    it('should not create actions receiving empty object', async () => {
      expect(handler.generateSetTokenisedCardsActions()).toEqual([])
    })
  })
})
