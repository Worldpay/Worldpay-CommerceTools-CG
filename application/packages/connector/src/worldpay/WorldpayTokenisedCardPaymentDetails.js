'use strict'

const WorldpayPaymentDetails = require('./WorldpayPaymentDetails')

/**
 * An optional Worldpay XML PaymentDetails entity, containing any direct or mobile payment method details
 * https://developer.worldpay.com/docs/wpg/hostedintegration/paymentrequests#order-elements
 */
class WorldpayTokenisedCardPaymentDetails extends WorldpayPaymentDetails {
  constructor(paymentTokenID, customerId, ipAddress) {
    super(constraints)

    this.withPaymentTokenID(paymentTokenID)
    this.withCustomerId(customerId)
    this.withIPAddress(ipAddress)
  }

  withPaymentTokenID(paymentTokenID) {
    this.paymentTokenID = paymentTokenID
    return this
  }

  withCustomerId(customerId) {
    this.customerId = customerId
    return this
  }

  withIPAddress(ipAddress) {
    this.ipAddress = ipAddress
    return this
  }

  buildXmlData() {
    const data = {
      'TOKEN-SSL': {
        '@tokenScope': 'shopper',
        '@captureCvc': 'true',
        paymentTokenID: this.paymentTokenID,
      },
      session: {
        '@shopperIPAddress': this.ipAddress,
        '@id': this.customerId,
      },
    }

    return data
  }
}

// Validation constraints
const constraints = {
  paymentTokenID: {
    presence: true,
  },
}

module.exports = WorldpayTokenisedCardPaymentDetails
