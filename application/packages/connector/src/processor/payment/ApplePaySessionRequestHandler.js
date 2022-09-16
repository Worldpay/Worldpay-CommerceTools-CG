'use strict'

const RequestHandler = require('./RequestHandler')
const { PAYMENT_METHOD_APPLE_PAY, PAYMENT_INTERFACE } = require('./constants')
const log = require('@gradientedge/wcc-logger')
const createApplePaySession = require('./ApplePaySession')
const PaymentProcessorException = require('./PaymentProcessorException')
const { codes: errorCodes } = require('./errors')
const { getSetCustomFieldAction, getAddInterfaceInteractionAction } = require('./CommercetoolsActions')
const { ResponseCodes } = require('http-headers-js')

class ApplePaySessionRequestHandler extends RequestHandler {
  name() {
    return 'ApplePaySessionRequestHandler'
  }

  /**
   * @param {object} payload
   * @returns {boolean} True if the request can be handled by this handler
   */
  isRequestApplicable(payload) {
    const { action, resourceTypeId, paymentInterface, paymentMethod } = this.extractRequestDetails(payload)

    return (
      resourceTypeId === 'payment' &&
      action === 'Create' &&
      paymentInterface === PAYMENT_INTERFACE &&
      paymentMethod === PAYMENT_METHOD_APPLE_PAY
    )
  }

  /**
   * Process the request
   *
   * @param {object} payload The payload from Commercetools
   * @param {object} headers Relevant HTTP headers
   * @returns {Promise<[]>} A list of commercetools actions
   */
  async process(payload, headers) {
    log.debug('Apple Pay session `process` parameters', { payload, headers })

    const paymentData = payload?.resource?.obj?.custom?.fields?.paymentData
    if (!paymentData) {
      throw new PaymentProcessorException([{ code: errorCodes.MISSING_PAYMENT_DATA_APPLE_PAY }])
    }
    const data = JSON.parse(paymentData)
    const validationURL = data?.validationURL

    if (!validationURL) {
      throw new PaymentProcessorException([{ code: errorCodes.MISSING_PAYMENT_DATA_APPLE_PAY }])
    }

    const actions = []
    try {
      const applePaySession = await this.createSession(validationURL)
      // Store the incoming request and Apple's response as a payment interaction
      actions.push(
        getAddInterfaceInteractionAction(paymentData, {
          ...applePaySession,
          data: JSON.stringify(applePaySession.data),
        }),
      )
      if (applePaySession.status === ResponseCodes.OK) {
        // Replace the request with the response
        actions.push(getSetCustomFieldAction('paymentData', JSON.stringify(applePaySession.data)))
      } else {
        // Send failure
        log.error('Failed to set up Apple Session', { applePaySession })
        actions.push(
          getSetCustomFieldAction('paymentData', JSON.stringify({ error: 'Failed to set up Apple Pay session' })),
        )
      }
    } catch (error) {
      log.error('Could not set up Apple Pay session', { error })
      actions.push(
        getSetCustomFieldAction('paymentData', JSON.stringify({ error: 'Failed to set up Apple Pay session' })),
      )
    }
    return actions
  }

  async createSession(validationURL) {
    return await createApplePaySession(validationURL)
  }
}

module.exports = { ApplePaySessionRequestHandler }
