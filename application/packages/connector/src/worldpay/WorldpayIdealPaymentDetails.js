'use strict'

const WorldpayPaymentDetails = require('./WorldpayPaymentDetails')

/**
 * Builder to create the Klarna Pay Now payment
 */
class WorldpayIdealPaymentDetails extends WorldpayPaymentDetails {
  constructor(successURL, failureURL, cancelURL, pendingURL) {
    super(constraints)

    this.withSuccessURL(successURL)
    this.withFailureURL(failureURL)
    this.withCancelURL(cancelURL)
    this.withPendingURL(pendingURL)
  }

  withSuccessURL(successURL) {
    this.successURL = successURL
    return this
  }

  withFailureURL(failureURL) {
    this.failureURL = failureURL
    return this
  }

  withCancelURL(cancelURL) {
    this.cancelURL = cancelURL
    return this
  }

  withPendingURL(pendingURL) {
    this.pendingURL = pendingURL
    return this
  }

  withShopperBankCode(shopperBankCode) {
    this.shopperBankCode = shopperBankCode
    return this
  }

  buildXmlData() {
    return {
      'IDEAL-SSL': {
        successURL: this.successURL,
        failureURL: this.failureURL,
        cancelURL: this.cancelURL,
        pendingURL: this.pendingURL,
        '@shopperBankCode': this.shopperBankCode,
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
  pendingURL: {
    type: 'string',
    presence: true,
  },
  shopperBankCode: {
    type: 'string',
    presence: true,
  },
}

module.exports = WorldpayIdealPaymentDetails
