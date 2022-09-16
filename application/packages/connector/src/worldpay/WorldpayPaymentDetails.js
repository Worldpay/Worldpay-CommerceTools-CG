'use strict'

const WorldpayBase = require('./WorldpayBase')

/**
 * Base case for all types of different (direct) payment methods
 */
class WorldpayPaymentDetails extends WorldpayBase {
  constructor(constraints) {
    super(constraints)
  }

  isPayment() {
    return true
  }
}

module.exports = WorldpayPaymentDetails
