'use strict'

const _ = require('lodash')
const DefaultStorageHandler = require('../../../src/processor/notification/DefaultStorageHandler')
const CommercetoolsClient = require('../../../src/commercetools/Client')
const WorldpayNotification = require('../../../src/worldpay/WorldpayNotification')
const { WORLDPAY_NOTIFICATION_TYPES } = require('../../../src/worldpay/constants')

const VALID_NOTIFICATION_XML = require('./data/notification')
const VALID_NOTIFICATION_OBJ = new WorldpayNotification(VALID_NOTIFICATION_XML)

describe('DefaultStorageHandler', () => {
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

    handler = new DefaultStorageHandler(commercetoolsClient, { test: 1 })
  })

  describe('constructor', () => {
    it('should store the `commercetoolsClient` and `options` parameters in instance properties', () => {
      expect(handler.options).toEqual({ test: 1 })
      expect(handler.commercetoolsClient).toBeInstanceOf(CommercetoolsClient)
    })

    it('should set the `maxAttempts` instance property to the default when none supplied in the `options` param', () => {
      expect(handler.maxAttempts).toBe(5)
    })

    it('should set the `maxAttempts` instance property to the `options.maxAttemps` property when set', () => {
      const handler = new DefaultStorageHandler(commercetoolsClient, { maxAttempts: 2 })
      expect(handler.maxAttempts).toBe(2)
    })
  })

  describe('execute', () => {
    beforeEach(() => {
      handler.getPaymentObject = jest.fn(() => ({ dummyPayment: true }))
      handler.getInterfaceInteractionDefinition = jest.fn(() => ({ dummyDefinition: 'definition' }))
      handler.addInterfaceInteractionToPaymentObject = jest.fn(() => ({ paymentId: '123' }))
    })

    it('should call `getPaymentObject` with the notification orderCode property', async () => {
      await handler.execute(VALID_NOTIFICATION_OBJ, VALID_NOTIFICATION_XML)
      expect(handler.getPaymentObject).toHaveBeenCalledTimes(1)
      expect(handler.getPaymentObject).toHaveBeenCalledWith(VALID_NOTIFICATION_OBJ.orderCode)
    })

    it('should call `getInterfaceInteractionDefinition` with the notification XML string', async () => {
      await handler.execute(VALID_NOTIFICATION_OBJ, VALID_NOTIFICATION_XML)
      expect(handler.getInterfaceInteractionDefinition).toHaveBeenCalledTimes(1)
      expect(handler.getInterfaceInteractionDefinition).toHaveBeenCalledWith(VALID_NOTIFICATION_XML)
    })

    it('should call `addInterfaceInteractionToPaymentObject` with the output of `getPaymentObject` and `getInterfaceInteractionDefinition`', async () => {
      await handler.execute(VALID_NOTIFICATION_OBJ, VALID_NOTIFICATION_XML)
      expect(handler.addInterfaceInteractionToPaymentObject).toHaveBeenCalledTimes(1)
      expect(handler.addInterfaceInteractionToPaymentObject).toHaveBeenCalledWith(
        { dummyPayment: true },
        { dummyDefinition: 'definition' },
      )
    })

    it('should return the output of `addInterfaceInteractionToPaymentObject``', async () => {
      const response = await handler.execute(VALID_NOTIFICATION_OBJ, VALID_NOTIFICATION_XML)
      expect(response).toEqual({ paymentId: '123' })
    })

    it('should return the output of `addInterfaceInteractionToPaymentObject``', async () => {
      const notification = _.merge({}, VALID_NOTIFICATION_OBJ, {
        type: WORLDPAY_NOTIFICATION_TYPES.ERROR,
      })
      const response = await handler.execute(notification, VALID_NOTIFICATION_XML)
      expect(response).toEqual({ paymentId: '123' })
    })
  })

  describe('getPaymentObject', () => {
    it('should call the `getPaymentById` on the commercetoolsClient with the given payment id', async () => {
      commercetoolsClient.getPaymentById = jest.fn(() => true)
      await handler.getPaymentObject('test-id')
      expect(commercetoolsClient.getPaymentById).toHaveBeenCalledTimes(1)
      expect(commercetoolsClient.getPaymentById).toHaveBeenCalledWith('test-id')
    })

    it('should return the output of `getPaymentById` when that output is truthy', async () => {
      commercetoolsClient.getPaymentById = jest.fn(() => ({ id: 'test-id' }))
      const response = await handler.getPaymentObject('test-id')
      expect(response).toEqual({ id: 'test-id' })
    })

    it('should throw an error when the payment is not found', async () => {
      commercetoolsClient.getPaymentById = jest.fn(() => null)
      await expect(() => handler.getPaymentObject('test-id')).rejects.toEqual(
        new Error("Payment object with id 'test-id' not found relating to notification"),
      )
    })
  })

  describe('getInterfaceInteractionDefinition', () => {
    it('should return the expected object', () => {
      jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01 13:25:12.546').getTime())
      expect(handler.getInterfaceInteractionDefinition('<xml>payload</xml>')).toEqual({
        type: {
          key: 'worldpay-notification-interface-interaction',
        },
        fields: {
          createdAt: '2020-01-01T13:25:12.546Z',
          request: '<xml>payload</xml>',
        },
      })
      jest.useRealTimers()
    })
  })

  describe('addInterfaceInteractionToPaymentObject', () => {
    let payment
    let interfaceInteraction

    beforeEach(() => {
      payment = { id: '123' }
      interfaceInteraction = { test: 1 }
    })

    it('should only call the `addInterfaceInteractionToPayment` method on the commercetools client once when the first call is successful', async () => {
      handler.commercetoolsClient.addInterfaceInteractionToPayment = jest.fn()
      await handler.addInterfaceInteractionToPaymentObject(payment, interfaceInteraction)
      expect(handler.commercetoolsClient.addInterfaceInteractionToPayment).toHaveBeenCalledTimes(1)
      expect(handler.commercetoolsClient.addInterfaceInteractionToPayment).toHaveBeenCalledWith(
        payment,
        interfaceInteraction,
      )
    })

    it('should call the `addInterfaceInteractionToPayment` method twice when the first call fails', async () => {
      handler.commercetoolsClient.getPaymentById = jest.fn()
      handler.commercetoolsClient.addInterfaceInteractionToPayment = jest
        .fn()
        .mockImplementationOnce(() => {
          throw { statusCode: 409 }
        })
        .mockReturnValueOnce('test')
      const result = await handler.addInterfaceInteractionToPaymentObject(payment, interfaceInteraction)
      expect(handler.commercetoolsClient.addInterfaceInteractionToPayment).toHaveBeenCalledTimes(2)
      expect(handler.commercetoolsClient.getPaymentById).toHaveBeenCalledTimes(1)
      expect(handler.commercetoolsClient.getPaymentById).toHaveBeenCalledWith('123')
      expect(result).toBe('test')
    })

    it('should throw an error when the `addInterfaceInteractionToPayment` method throw an error with a status code that is not 409', async () => {
      handler.commercetoolsClient.addInterfaceInteractionToPayment = jest.fn().mockImplementationOnce(() => {
        throw { statusCode: 500 }
      })
      await expect(handler.addInterfaceInteractionToPaymentObject(payment, interfaceInteraction)).rejects.toEqual({
        statusCode: 500,
      })
    })
  })
})
