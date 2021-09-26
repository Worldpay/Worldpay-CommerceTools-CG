'use strict'

const WorldpayBase = require('./WorldpayBase')

/**
 * A Worldpay XML Amount entity, containing currency code(ISO4217), exponent and value
 * https://developer.worldpay.com/docs/wpg/hostedintegration/paymentrequests#order-elements
 */
class WorldpayAmount extends WorldpayBase {
  constructor(currencyCode, value, exponent = 2) {
    super(constraints)

    if (currencyCode) {
      this.withCurrencyCode(currencyCode)
    }
    if (value) {
      this.withValue(value, exponent)
    }
  }

  withCurrencyCode(currencyCode) {
    this.currencyCode = currencyCode
    return this
  }

  withValue(value, exponent = 2) {
    this.value = value
    this.exponent = exponent
    return this
  }

  buildXmlData() {
    const data = {
      amount: {
        '@currencyCode': this.currencyCode,
        '@exponent': this.exponent,
        '@value': this.value,
      },
    }

    return data
  }
}

const constraints = {
  currencyCode: {
    presence: true,
    type: 'string',
    length: 3,
    currency: true,
  },
  value: {
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
    },
  },
  exponent: {
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
      lessThanOrEqualTo: 20,
    },
  },
}

module.exports = WorldpayAmount
