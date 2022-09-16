'use strict'

const { ResponseCodes } = require('http-headers-js')

const log = require('@gradientedge/wcc-logger')
const { WORLDPAY_NOTIFICATION_TYPES } = require('../../worldpay/constants')
const { NOTIFICATION_INTERFACE_INTERACTION_TYPE_KEY } = require('../payment/constants')

const MAX_ATTEMPTS = 5

class DefaultStorageHandler {
  /**
   * Handle the storing of the notification
   *
   * @param {CommercetoolsClient} commercetoolsClient commercetools client
   * @param {object} options Config object
   */
  constructor(commercetoolsClient, options) {
    this.commercetoolsClient = commercetoolsClient
    this.options = options
    this.maxAttempts = this.options.maxAttempts || MAX_ATTEMPTS
  }

  /**
   * Handle the storing of the notification
   *
   * In this implementation we're storing the notification against the payment object
   * who's ID should be in the notification XML as the orderCode.
   *
   * @param {WorldpayNotification} notification The notification object
   * @param {string} xmlPayloadString The XML payload of the notification
   * @returns {Promise<{}>}
   */
  async execute(notification, xmlPayloadString) {
    let payment = await this.getPaymentObject(notification.orderCode)
    log.debug('Payment found relating to notification', { payment, notification })
    if (notification.type === WORLDPAY_NOTIFICATION_TYPES.ERROR) {
      log.error('Error notification received', { payment, notification })
    }
    const interfaceInteraction = this.getInterfaceInteractionDefinition(xmlPayloadString)
    log.debug('Adding interface interaction to payment', { payment, interfaceInteraction })
    payment = await this.addInterfaceInteractionToPaymentObject(payment, interfaceInteraction)
    return payment
  }

  /**
   * Retrieve the payment object from commercetools
   *
   * @param {string} paymentId The payment id to retrieve
   * @returns {Promise<{}>}
   */
  async getPaymentObject(paymentId) {
    let payment = await this.commercetoolsClient.getPaymentById(paymentId)
    if (!payment) {
      throw new Error(`Payment object with id '${paymentId}' not found relating to notification`)
    }
    return payment
  }

  /**
   * Get the interface interaction definition
   *
   * @param {string} xmlPayloadString The XML payload string
   * @returns {{type: {key: (string|string)}, fields: {createdAt: string, request: string}}}
   */
  getInterfaceInteractionDefinition(xmlPayloadString) {
    return {
      type: {
        key: NOTIFICATION_INTERFACE_INTERACTION_TYPE_KEY,
      },
      fields: {
        createdAt: new Date().toISOString(),
        request: xmlPayloadString,
      },
    }
  }

  /**
   * Add the interface interaction to the payment object
   *
   * Note that it's very common for Worldpay to send us two notifications at
   * pretty much the same time. This can result in a scenario where the two requests
   * follow the same code flow at more or less the same time. As a result, they both
   * get the same object, with the same version number, which they then both use to
   * add an interface interaction. Which ever request is last to add the interface
   * interaction will get a 409 status code response as the previous request will
   * have already added an interface interaction, resulting in the payment object's
   * version number being updated. In order to deal with this scenario, if we get
   * a 409 response code we get the payment object again, and try to add the
   * interface interaction again. We do this for up to MAX_ATTEMPTS before rethrowing
   * the exception.
   *
   * @param {object} payment Payment object as returned from commercetools
   * @param {object} interfaceInteraction Object defining the interface interaction
   * @returns {Promise<{}>}
   */
  async addInterfaceInteractionToPaymentObject(payment, interfaceInteraction) {
    let revisedPayment = payment
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      try {
        revisedPayment = await this.commercetoolsClient.addInterfaceInteractionToPayment(
          revisedPayment,
          interfaceInteraction,
        )
        break
      } catch (e) {
        if (e.statusCode !== ResponseCodes.CONFLICT) {
          throw e
        }
        log.debug(`Attempt ${attempt} to add interface interaction to payment failed`, {
          payment,
          interfaceInteraction,
        })
        revisedPayment = await this.commercetoolsClient.getPaymentById(payment.id)
      }
    }
    return revisedPayment
  }
}

module.exports = DefaultStorageHandler
