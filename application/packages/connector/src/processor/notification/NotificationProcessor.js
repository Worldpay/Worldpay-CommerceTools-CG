'use strict'

const _ = require('lodash')
const CommercetoolsClient = require('../../commercetools/Client')
const NotificationRequestHandler = require('./NotificationRequestHandler')

/**
 * Notification processor
 */
class NotificationProcessor {
  /**
   * Constructor
   *
   * The `options` parameter must contain the following properties:
   *
   *  - merchantCode: Merchant's Worldpay merchant code
   *  - installationId: Merchant's Worldpay installation ID
   *  - env: Worldpay environment ('test' or 'production')
   *
   *  Optionally, the `options` parameter may contain the following:
   *
   * @param {CommercetoolsClient} commercetoolsClient An instance of CommercetoolsClient
   * @param {object} options Configuration options
   */
  constructor(commercetoolsClient, options = {}) {
    if (!(commercetoolsClient instanceof CommercetoolsClient)) {
      throw new Error('`commercetoolsClient` parameter must be of type CommercetoolsClient')
    }
    if (!_.isObject(options)) {
      throw new Error('`options` parameter must be an object')
    }
    this.commercetoolsClient = commercetoolsClient
    this.options = options
  }

  /**
   * Handle the processing of the Worldpay notification XML
   *
   * For more details on the `payload` parameter, see:
   * https://developer.worldpay.com/docs/wpg/manage/ordernotifications#xml-notifications
   *
   * @param {object} payload The XML payload from Worldpay
   * @returns {object} A map of promises
   */
  execute(payload) {
    const requestHandler = new NotificationRequestHandler(this.commercetoolsClient, this.options)
    return requestHandler.process(payload)
  }
}

module.exports = NotificationProcessor
