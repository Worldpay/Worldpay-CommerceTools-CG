'use strict'

const WorldpayBase = require('./WorldpayBase')

/**
 * Worldpay XML Shopper entity
 * https://developer.worldpay.com/docs/wpg/hostedintegration/paymentrequests#order-elements
 */
class WorldpayShopper extends WorldpayBase {
  constructor(emailAddress) {
    super(constraints)
    this.emailAddress = emailAddress
  }

  withBrowserAcceptHeader(header) {
    this.browserAcceptHeader = header
    return this
  }

  withBrowserUserAgentHeader(header) {
    this.browserUserAgentHeader = header
    return this
  }

  buildXmlData() {
    const data = {
      shopper: {
        shopperEmailAddress: this.emailAddress,
      },
    }

    if (this.browserAcceptHeader || this.browserUserAgentHeader) {
      data.shopper.browser = {}
      if (this.browserAcceptHeader) {
        data.shopper.browser.acceptHeader = this.browserAcceptHeader
      }
      if (this.browserUserAgentHeader) {
        data.shopper.browser.userAgentHeader = this.browserUserAgentHeader
      }
    }

    return data
  }
}

const constraints = {
  emailAddress: {
    presence: true,
    email: true,
  },
  browserAcceptHeader: {
    type: 'string',
  },
  browserUserAgentHeader: {
    type: 'string',
  },
}

module.exports = WorldpayShopper
