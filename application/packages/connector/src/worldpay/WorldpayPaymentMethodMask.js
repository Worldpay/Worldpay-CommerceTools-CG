'use strict'

const WorldpayBase = require('./WorldpayBase')
const constants = require('./constants')
const _ = require('lodash')

/**
 * Worldpay XML PaymentMethodMask entity - Limits the available payment methods to be shown to the shopper
 * https://developer.worldpay.com/docs/wpg/hostedintegration/paymentrequests#paymentmethodmask-element
 */
class WorldpayPaymentMethodMask extends WorldpayBase {
  constructor(include, exclude) {
    super(constraints)

    if (_.isString(include)) {
      this.include = [include]
    } else if (_.isArray(include) && !_.isEmpty(include)) {
      this.include = include
    }

    if (_.isString(exclude)) {
      this.exclude = [exclude]
    } else if (_.isArray(exclude) && !_.isEmpty(exclude)) {
      this.exclude = exclude
    }
  }

  includeAll() {
    this.include = [constants.WORLDPAY_PAYMENT_METHOD_MASK_ALL]
    return this
  }

  includeOnline() {
    this.include = [constants.WORLDPAY_PAYMENT_METHOD_MASK_ONLINE]
    return this
  }

  buildXmlData() {
    let includeItems, excludeItems
    if (this.include) {
      includeItems = this.include.map((item) => ({ '@code': item }))
    }

    if (this.exclude) {
      excludeItems = this.exclude.map((item) => ({ '@code': item }))
    }

    const data = {
      paymentMethodMask: {
        include: includeItems,
        exclude: excludeItems,
      },
    }

    return data
  }
}

const constraints = {
  include: {
    presence: true,
  },
}

module.exports = WorldpayPaymentMethodMask
