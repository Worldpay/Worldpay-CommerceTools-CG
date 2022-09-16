'use strict'

const RequestHandler = require('./RequestHandler')
const _ = require('lodash')
const {
  PAYMENT_METHOD_APPLE_PAY,
  PAYMENT_INTERFACE,
  PAYMENT_METHOD_CARD,
  PAYMENT_METHOD_TOKENISED_CARD,
  PAYMENT_METHOD_GOOGLE_PAY,
  PAYMENT_METHOD_PAYPAL,
  PAYMENT_METHOD_KLARNA_PAYNOW,
  PAYMENT_METHOD_KLARNA_PAYLATER,
  PAYMENT_METHOD_KLARNA_PAYSLICED,
  PAYMENT_METHOD_IDEAL,
} = require('./constants')
const { Logger } = require('@gradientedge/wcc-logger')
const context = require('@gradientedge/wcc-context')
const PaymentRequestHandler = require('./PaymentRequestHandler')
const PaymentOrderBuilder = require('./PaymentOrderBuilder')

const PAYMENT_METHODS = [
  PAYMENT_METHOD_CARD,
  PAYMENT_METHOD_TOKENISED_CARD,
  PAYMENT_METHOD_GOOGLE_PAY,
  PAYMENT_METHOD_APPLE_PAY,
  PAYMENT_METHOD_PAYPAL,
  PAYMENT_METHOD_KLARNA_PAYNOW,
  PAYMENT_METHOD_KLARNA_PAYLATER,
  PAYMENT_METHOD_KLARNA_PAYSLICED,
  PAYMENT_METHOD_IDEAL,
]

class WorldpayCommunicationRequestHandler extends RequestHandler {
  constructor({ commercetoolsClient, options, project }) {
    super()
    this.commercetoolsClient = commercetoolsClient
    this.options = options
    this.project = project
  }

  name() {
    return 'WorldpayCommunicationRequestHandler'
  }

  /**
   * Determine whether the processor should deal with this payload
   *
   * @param {object} payload The incoming payload
   * @returns {boolean} Whether to deal with this request or not
   */
  isRequestApplicable(payload) {
    const { action, resourceTypeId, paymentInterface, paymentMethod } = this.extractRequestDetails(payload)

    return (
      resourceTypeId === 'payment' &&
      ((action === 'Create' && paymentMethod !== PAYMENT_METHOD_APPLE_PAY) ||
        this.applePayUpdateToCommunicate(action, payload)) &&
      paymentInterface === PAYMENT_INTERFACE &&
      PAYMENT_METHODS.includes(paymentMethod)
    )
  }

  /**
   * In case of an updated Apple Pay payment, it could be one that requires a message to Worldpay.
   * There are multiple processes updating the payment object (storefront and notification process). We only want to
   * communicate the information with the Worldpay service once, so we skip processing if the completed flag is present
   * and has value 'true'.
   *
   * @param {string} action The action (Create|Update)
   * @param {object} payload The incoming payload
   * @returns {boolean} Whether to deal with this update
   */
  applePayUpdateToCommunicate(action, payload) {
    const paymentMethod = _.get(payload, 'resource.obj.paymentMethodInfo.method')
    const paymentDataString = _.get(payload, 'resource.obj.custom.fields.paymentData')
    const paymentData = paymentDataString ? JSON.parse(paymentDataString) : undefined
    const completedFlag = paymentData?.completed

    return (
      action === 'Update' &&
      paymentMethod === PAYMENT_METHOD_APPLE_PAY &&
      paymentData &&
      !completedFlag &&
      !paymentData.nonce
    )
  }

  /**
   * Process a communication to Worldpay message
   *
   * @param {object} payload The payload from Commercetools
   * @param {object} headers Object of HTTP headers (lowercase keys)
   * @returns {Promise<[]>}
   */
  async process(payload, headers) {
    return new Promise((resolve, reject) => {
      const contextData = {
        logger: new Logger(),
      }
      context.create(contextData, async () => {
        const requestHandler = new PaymentRequestHandler(
          this.commercetoolsClient,
          this.options,
          this.project,
          new PaymentOrderBuilder(this.options, this.project),
        )
        try {
          const response = await requestHandler.process(payload, headers)
          resolve(response)
        } catch (e) {
          reject(e)
        }
      })
    })
  }
}

module.exports = { WorldpayCommunicationRequestHandler }
