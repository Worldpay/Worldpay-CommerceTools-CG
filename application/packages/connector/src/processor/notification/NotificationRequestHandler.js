'use strict'

const _ = require('lodash')
const log = require('@gradientedge/wcc-logger')
const WorldpayNotification = require('../../worldpay/WorldpayNotification')
const DefaultProcessHandler = require('./DefaultProcessHandler')
const DefaultStorageHandler = require('./DefaultStorageHandler')

class NotificationRequestHandler {
  /**
   * Constructor
   *
   * @param {CommercetoolsClient} commercetoolsClient
   * @param {object} options
   */
  constructor(commercetoolsClient, options) {
    this.commercetoolsClient = commercetoolsClient

    if (options.handleStorage === null) {
      this.handleStorage = null
    } else if (_.isUndefined(options.handleStorage)) {
      this.handleStorage = new DefaultStorageHandler(commercetoolsClient, options)
    } else {
      this.handleStorage = new options.handleStorage(commercetoolsClient, options)
    }

    if (options.handleProcess === null) {
      this.handleProcess = null
    } else if (_.isUndefined(options.handleProcess)) {
      this.handleProcess = new DefaultProcessHandler(commercetoolsClient, options)
    } else {
      this.handleProcess = new options.handleProcess(commercetoolsClient, options)
    }

    this.options = _.omit(options, ['handleStorage', 'handleProcess'])
  }

  /**
   * Process the request
   *
   * @param {string} xmlPayloadString The notification XML as received from Worldpay
   * @returns {object}
   */
  process(xmlPayloadString) {
    log.debug('`process` parameters', { payload: xmlPayloadString })

    this.notification = this.constructNotification(xmlPayloadString)
    log.debug('Notification object', { notification: this.notification })
    this.validateNotification(this.notification)

    this.storagePromise = this.getStoragePromise(this.notification, xmlPayloadString)
    this.processPromise = this.getProcessPromise(this.notification)

    return {
      storage: this.storagePromise,
      process: this.processPromise,
    }
  }

  /**
   * Construct the notification
   *
   * @param {string} xmlPayloadString
   * @returns {WorldpayNotification}
   */
  constructNotification(xmlPayloadString) {
    return new WorldpayNotification(xmlPayloadString)
  }

  /**
   * Validate the notification
   *
   * @param {WorldpayNotification} notification
   */
  validateNotification(notification) {
    if (notification.merchantCode !== this.options.merchantCode) {
      throw new Error(
        `Notification merchant code '${notification.merchantCode}' does not match configuration merchant code '${this.options.merchantCode}'`,
      )
    }
  }

  /**
   * Get the promise that we need to wait on for the storage functionality to complete
   *
   * @param {WorldpayNotification} notification
   * @param {string} xmlPayloadString XML notification payload
   * @returns {Promise<null|*>}
   */
  async getStoragePromise(notification, xmlPayloadString) {
    if (this.handleStorage) {
      return await this.handleStorage.execute(notification, xmlPayloadString)
    }
    return null
  }

  /**
   * Get the promise that we need to wait on for the processing functionality to complete
   *
   * @param {WorldpayNotification} notification
   * @returns {Promise<null|*>}
   */
  async getProcessPromise(notification) {
    if (this.handleProcess) {
      let storageResult
      try {
        storageResult = await this.storagePromise
      } catch (e) {
        log.error('Storage failed', { error: e.toString(), stack: e.stack })
        return null
      }
      return this.handleProcess.execute(notification, storageResult)
    }
    return null
  }
}

module.exports = NotificationRequestHandler
