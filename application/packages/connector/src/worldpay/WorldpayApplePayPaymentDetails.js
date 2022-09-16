'use strict'

const WorldpayPaymentDetails = require('./WorldpayPaymentDetails')

/**
 * An optional Worldpay XML PaymentDetails entity, containing Apple Pay wallet payment method details
 * https://developer.worldpay.com/docs/wpg/mobilewallets/applepay
 */
class WorldpayApplePayPaymentDetails extends WorldpayPaymentDetails {
  constructor(customerId, ipAddress) {
    super(constraints)

    this.withCustomerId(customerId)
    this.withIPAddress(ipAddress)
  }

  withEphemeralPublicKey(ephemeralPublicKey) {
    this.ephemeralPublicKey = ephemeralPublicKey
    return this
  }

  withPublicKeyHash(publicKeyHash) {
    this.publicKeyHash = publicKeyHash
    return this
  }

  withTransactionId(transactionId) {
    this.transactionId = transactionId
    return this
  }

  withSignature(signature) {
    this.signature = signature
    return this
  }

  withVersion(version) {
    this.version = version
    return this
  }

  withData(data) {
    this.data = data
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
      'APPLEPAY-SSL': {
        header: {
          ephemeralPublicKey: this.ephemeralPublicKey,
          publicKeyHash: this.publicKeyHash,
          transactionId: this.transactionId,
        },
        signature: this.signature,
        version: this.version,
        data: this.data,
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
  ephemeralPublicKey: {
    presence: true,
  },
  publicKeyHash: {
    presence: true,
  },
  transactionId: {
    presence: true,
  },
  signature: {
    presence: true,
  },
  version: {
    presence: true,
  },
  data: {
    presence: true,
  },
}

module.exports = WorldpayApplePayPaymentDetails
