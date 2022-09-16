'use strict'

const WorldpayBase = require('./WorldpayBase')
const WorldpayLineItem = require('./WorldpayLineItem')

/**
 * A Worldpay XML OrderLines entity used for detailed order line items
 * https://developer.worldpay.com/docs/wpg/hostedintegration/paymentrequests#shippingaddress-and-billingaddress
 */
class WorldpayOrderLines extends WorldpayBase {
  constructor() {
    super(constraints)
  }

  withOrderTaxAmount(orderTaxAmount) {
    this.orderTaxAmount = orderTaxAmount
    return this
  }

  withTermsURL(termsURL) {
    this.termsURL = termsURL
    return this
  }

  withLineItem(lineItem) {
    if (!(lineItem instanceof WorldpayLineItem)) {
      throw new Error('lineItem not an instance of LineItem')
    }
    if (!this.lineItems) {
      this.lineItems = []
    }
    this.lineItems.push(lineItem)
    return this
  }

  buildXmlData() {
    const data = {
      orderTaxAmount: this.orderTaxAmount,
      termsURL: this.termsURL,
      lineItem: this.lineItems.map((item) => item.buildXmlData()),
    }

    return data
  }
}

const constraints = {
  orderTaxAmount: {
    presence: true,
  },
  termsURL: {
    presence: true,
  },
}

module.exports = WorldpayOrderLines
