'use strict'

const WorldpayPaymentDetails = require('./WorldpayPaymentDetails')

/**
 * Builder to create the PayPal payment
 */
class WorldpayPayPalPaymentDetails extends WorldpayPaymentDetails {
  constructor(successURL, failureURL, cancelURL) {
    super(constraints)

    this.withSuccessURL(successURL)
    this.withFailureURL(failureURL)
    this.withCancelURL(cancelURL)
  }

  withSuccessURL(withSuccessURL) {
    this.successURL = withSuccessURL
    return this
  }

  withFailureURL(withFailureURL) {
    this.failureURL = withFailureURL
    return this
  }

  withCancelURL(withCancelURL) {
    this.cancelURL = withCancelURL
    return this
  }

  buildXmlData() {
    return {
      'PAYPAL-EXPRESS': {
        successURL: this.successURL,
        failureURL: this.failureURL,
        cancelURL: this.cancelURL,
      },
    }
  }
}

// Validation constraints
const constraints = {
  successURL: {
    type: 'string',
    presence: true,
  },
  failureURL: {
    type: 'string',
    presence: true,
  },
  cancelURL: {
    type: 'string',
    presence: true,
  },
}

module.exports = WorldpayPayPalPaymentDetails
