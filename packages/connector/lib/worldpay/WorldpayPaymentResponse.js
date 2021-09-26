'use strict'

const WorldpayBase = require('./WorldpayBase')
const { parseXml } = require('./xmlParser')
const _ = require('lodash')

/**
 * Worldpay XML payment response entity - XML response received from Worldpay following a payment request
 * https://developer.worldpay.com/docs/wpg/hostedintegration/paymentrequests#our-response
 */
class WorldpayPaymentResponse extends WorldpayBase {
  constructor() {
    super(constraints)
  }

  fromXmlData(xml) {
    const xmlData = parseXml(xml)
    if (!xmlData || !xmlData.paymentService) {
      throw new Error('Worldpay response XML missing expected paymentService node')
    }
    this.worldpayDtdVersion = xmlData.paymentService['@version']
    this.merchantCode = xmlData.paymentService['@merchantCode']

    if (!xmlData.paymentService.reply) {
      throw new Error('Worldpay response XML missing expected paymentService.reply node')
    }
    if (!xmlData.paymentService.reply.orderStatus) {
      throw new Error(
        'Worldpay response XML missing expected paymentService.reply.orderStatus node'
      )
    }

    const orderStatus = xmlData.paymentService.reply.orderStatus
    this.orderCode = orderStatus['@orderCode']

    if (orderStatus.reference) {
      this.referenceId = orderStatus.reference['@id']
      this.referenceValue = _.unescape(orderStatus.reference['#'])
      // Update constraints with expected values found in reference node
      super.addConstraints({
        referenceId: {
          presence: { allowEmpty: false },
        },
        referenceValue: {
          presence: { allowEmpty: false },
          url: true,
        },
      })
    }

    // if (orderStatus.payment) {
    //   // TODO - Direct integration - `payment` node will exist here
    // }

    return this
  }
}

const constraints = {
  merchantCode: {
    presence: { allowEmpty: false },
  },
  worldpayDtdVersion: {
    presence: { allowEmpty: false },
  },
  orderCode: {
    presence: { allowEmpty: false },
  },
}

module.exports = WorldpayPaymentResponse
