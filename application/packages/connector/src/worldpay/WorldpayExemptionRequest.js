'use strict'

const WorldpayPaymentDetails = require('./WorldpayPaymentDetails')
const WP = require('./constants')

/**
 * Builder to create the Worldpay Exemption Request entity
 */
class WorldpayExemptionRequest extends WorldpayPaymentDetails {
  constructor() {
    super(constraints)
  }

  withType(type) {
    this.type = type
    return this
  }

  withPlacement(placement) {
    this.placement = placement
    return this
  }

  buildXmlData() {
    return {
      exemption: {
        '@type': this.type,
        '@placement': this.placement,
      },
    }
  }
}

const constraints = {
  type: {
    presence: true,
    inclusion: [WP.WORLDPAY_EXEMPTION_TYPE_LV, WP.WORLDPAY_EXEMPTION_TYPE_LR, WP.WORLDPAY_EXEMPTION_TYPE_OP],
  },
  placement: {
    type: 'string',
    presence: true,
    inclusion: [
      WP.WORLDPAY_EXEMPTION_PLACEMENT_AUTHENTICATION,
      WP.WORLDPAY_EXEMPTION_PLACEMENT_AUTHORISATION,
      WP.WORLDPAY_EXEMPTION_PLACEMENT_OPTIMISED,
    ],
  },
}

module.exports = WorldpayExemptionRequest
