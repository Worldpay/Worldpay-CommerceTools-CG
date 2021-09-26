'use strict'

const NotificationRequestHandler = require('../../../lib/processor/notification/NotificationRequestHandler')
const DefaultStorageHandler = require('../../../lib/processor/notification/DefaultStorageHandler')
const DefaultProcessHandler = require('../../../lib/processor/notification/DefaultProcessHandler')
const WorldpayNotification = require('../../../lib/worldpay/WorldpayNotification')
const CommercetoolsClient = require('../../../lib/commercetools/Client')

jest.mock('../../../lib/worldpay/WorldpayNotification')

const VALID_XML_STRING = require('./data/notification')

describe('NotificationRequestHandler', () => {
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

    processor = new NotificationRequestHandler(commercetoolsClient, {
      handleStorage: null,
      handleProcess: null,
    })
  })

  describe('constructor', () => {
    it('should assign the commercetoolsClient and options to instance variables', () => {
      expect(processor.commercetoolsClient).toBe(commercetoolsClient)
      expect(processor.options).toEqual({})
    })

    it('should extract the handleStorage and handleProcess options in to instance variables', () => {
      const processor = new NotificationRequestHandler(commercetoolsClient, {
        handleStorage: DefaultStorageHandler,
        handleProcess: DefaultProcessHandler,
      })
      expect(processor.handleStorage).toBeInstanceOf(DefaultStorageHandler)
      expect(processor.handleProcess).toBeInstanceOf(DefaultProcessHandler)
    })
  })

  describe('process', () => {
    beforeEach(() => {
      processor.constructNotification = jest.fn(() => 'mockNotification')
      processor.validateNotification = jest.fn()
      processor.getStoragePromise = jest.fn(() => Promise.resolve('storageReturnValue'))
      processor.getProcessPromise = jest.fn(() => Promise.resolve('processReturnValue'))
    })

    it('should return an object with a `storage` and `process` properties, which should be promises', () => {
      const response = processor.process()
      expect(response).toEqual({
        storage: expect.any(Promise),
        process: expect.any(Promise),
      })
    })

    it('should call `constructNotification` to build the notification', () => {
      processor.process('<xml>test</xml>')
      expect(processor.constructNotification).toHaveBeenCalledTimes(1)
      expect(processor.constructNotification).toHaveBeenCalledWith('<xml>test</xml>')
    })

    it('should call `validateNotification` with the output of `constructNotification`', () => {
      processor.constructNotification.mockReturnValue({ test: 1 })
      processor.process('<xml>test</xml>')
      expect(processor.validateNotification).toHaveBeenCalledTimes(1)
      expect(processor.validateNotification).toHaveBeenCalledWith({ test: 1 })
    })

    it('should call `getStoragePromise` and return the output in the `storage` property', async () => {
      const result = processor.process('<xml>test</xml>')
      const storageResult = await result.storage
      expect(storageResult).toBe('storageReturnValue')
    })

    it('should call `getProcessPromise` and return the output in the `process` property', async () => {
      const result = processor.process('<xml>test</xml>')
      const processResult = await result.process
      expect(processResult).toBe('processReturnValue')
    })
  })

  describe('getStoragePromise', () => {
    it('should return the response from `handleStorage` when the `handleStorage` option is defined', async () => {
      const handleStorage = new Function()
      handleStorage.prototype.execute = jest.fn(() => Promise.resolve('dummyHandleStorageResponse'))
      const processor = new NotificationRequestHandler(commercetoolsClient, {
        dummyOption: 'myOption',
        handleStorage,
      })
      const response = await processor.getStoragePromise({ test: 1 }, '<xml>payload</xml>')
      expect(processor.handleStorage.execute).toHaveBeenCalledTimes(1)
      expect(processor.handleStorage.execute).toHaveBeenCalledWith(
        { test: 1 },
        '<xml>payload</xml>'
      )
      expect(response).toBe('dummyHandleStorageResponse')
    })

    it('should return null when the `handleStorage` option is set to null', async () => {
      const processor = new NotificationRequestHandler(commercetoolsClient, {
        dummyOption: 'myOption',
        handleStorage: null,
      })
      const response = await processor.getStoragePromise({ test: 1 })
      expect(response).toBeNull()
    })
  })

  describe('getProcessPromise', () => {
    it('should return the response from `handleProcess` if the storage promise resolves', async () => {
      const handleProcess = new Function()
      handleProcess.prototype.execute = jest.fn(() => Promise.resolve('dummyHandleProcessResponse'))
      const processor = new NotificationRequestHandler(commercetoolsClient, {
        dummyOption: 'myOption',
        handleProcess,
      })
      this.storagePromise = Promise.resolve('dummyHandleStorageResponse')
      const response = await processor.getProcessPromise({ test: 1 })
      expect(response).toBe('dummyHandleProcessResponse')
    })

    it('should return null if the storage promise was rejected', async () => {
      const processor = new NotificationRequestHandler(commercetoolsClient, {
        dummyOption: 'myOption',
        handleProcess: jest.fn(() => Promise.resolve('dummyHandleProcessResponse')),
      })
      processor.storagePromise = Promise.reject('dummyHandleStorageError')
      const response = await processor.getProcessPromise({ test: 1 })
      expect(response).toBeNull()
    })

    it('should return null if `handleProcess` option is set to null', async () => {
      const processor = new NotificationRequestHandler(commercetoolsClient, {
        dummyOption: 'myOption',
        handleProcess: null,
      })
      processor.storagePromise = Promise.resolve('dummyHandleStorageResponse')
      const response = await processor.getProcessPromise({ test: 1 })
      expect(response).toBeNull()
    })
  })

  describe('constructNotification', () => {
    it('should return an instance of a WorldpayNotification class', () => {
      const processor = new NotificationRequestHandler(commercetoolsClient, {})
      expect(processor.constructNotification(VALID_XML_STRING)).toBeInstanceOf(WorldpayNotification)
      expect(WorldpayNotification.prototype.constructor).toHaveBeenCalledTimes(1)
      expect(WorldpayNotification.prototype.constructor).toHaveBeenCalledWith(VALID_XML_STRING)
    })
  })

  describe('validateNotification', () => {
    it('should not throw if the notification object is valid', () => {
      const processor = new NotificationRequestHandler(commercetoolsClient, {
        merchantCode: 'testMerchantCode',
      })
      expect(() =>
        processor.validateNotification({ merchantCode: 'testMerchantCode' })
      ).not.toThrow()
    })

    it('should throw if the notification object is not valid', () => {
      const processor = new NotificationRequestHandler(commercetoolsClient, {
        merchantCode: 'testMerchantCode',
      })
      expect(() =>
        processor.validateNotification({ merchantCode: 'testMerchantCodeInvalid' })
      ).toThrow()
    })
  })
})
