'use strict'

const WorldpayPaymentDetails = require('./WorldpayPaymentDetails')

/**
 * An optional Worldpay XML PaymentDetails entity, containing any direct or mobile payment method details
 * https://developer.worldpay.com/docs/wpg/hostedintegration/paymentrequests#order-elements
 */
class WorldpayGooglePayPaymentDetails extends WorldpayPaymentDetails {
  constructor(protocolVersion, signature, signedMessage, customerId, ipAddress) {
    super(constraints)

    this.withProtocolVersion(protocolVersion)
    this.withSignature(signature)
    this.withSignedMessage(signedMessage)
    this.withCustomerId(customerId)
    this.withIPAddress(ipAddress)
  }

  withProtocolVersion(protocolVersion) {
    this.protocolVersion = protocolVersion
    return this
  }

  withSignature(signature) {
    this.signature = signature
    return this
  }

  withSignedMessage(signedMessage) {
    this.signedMessage = signedMessage
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
    return {
      'PAYWITHGOOGLE-SSL': {
        protocolVersion: this.protocolVersion,
        signature: this.signature,
        signedMessage: this.signedMessage,
      },
      session: {
        '@shopperIPAddress': this.ipAddress,
        '@id': this.customerId,
      },
    }
  }
}

// Validation constraints
const constraints = {
  protocolVersion: {
    type: 'string',
    presence: true,
  },
  signature: {
    type: 'string',
    presence: true,
  },
  signedMessage: {
    type: 'string',
    presence: true,
  },
}

module.exports = WorldpayGooglePayPaymentDetails
