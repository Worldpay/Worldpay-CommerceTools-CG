'use strict'

const validate = require('validate.js')
const _ = require('lodash')
const cc = require('currency-codes')

/**
 * Base class for all Worldpay XML entities
 * Provides validation and utility methods related to Worldpay XML generation
 */
class WorldpayBase {
  constructor(constraints) {
    this.constraints = _.clone(constraints)
  }

  validate() {
    let results = validate(this, this.constraints, { format: 'flat' })

    // Perform validation on any sub-components of this class that also have validation
    // i.e. the PaymentRequest.amount is of type WorldpayAmount which has its own validation
    for (const property in this) {
      if (this[property] instanceof WorldpayBase) {
        results = _.merge(results, validate(this[property], this[property].constraints))
      }
    }
    // validator should return undefined if there are no validation errors - the lodash merge
    // will create an empty object if we checked any sub-property validations
    return _.isEmpty(results) ? undefined : results
  }

  isValid() {
    return _.isEmpty(this.validate())
  }

  addConstraints(constraints) {
    this.constraints = _.merge(this.constraints, constraints)
  }

  /**
   * Convert a Date to a set of XML attributes conforming to a Worldpay timestamp
   * [WPG XML date/time format: specify sub-attributes second, minute, hour, dayOfMonth, month, year]
   *
   * @param {Date} date the date to convert to Worldpay format
   */
  asWorldpayTimestamp(worldpayDate) {
    if (!worldpayDate) {
      return
    }

    if (!(worldpayDate instanceof Date)) {
      throw new Error('worldpayDate must be of type date')
    }

    return {
      date: {
        '@second': worldpayDate.getSeconds(),
        '@minute': worldpayDate.getMinutes(),
        '@hour': worldpayDate.getHours(),
        '@dayOfMonth': worldpayDate.getDate(),
        '@month': worldpayDate.getMonth() + 1, // January==0
        '@year': worldpayDate.getFullYear(),
      },
    }
  }

  /**
   * Convert a Date to a set of XML attributes conforming to a Worldpay date
   * [WPG XML date format: specify sub-attributes dayOfMonth, month, year]
   *
   * @param {Date} date the date to convert to Worldpay format
   */
  asWorldpayDate(worldpayDate) {
    if (!worldpayDate) {
      return
    }

    if (!(worldpayDate instanceof Date)) {
      throw new Error('worldpayDate must be of type date')
    }

    return {
      date: {
        '@dayOfMonth': worldpayDate.getDate(),
        '@month': worldpayDate.getMonth() + 1, // January==0
        '@year': worldpayDate.getFullYear(),
      },
    }
  }
}

validate.validators.currency = function (value) {
  if (!_.isString(value) || !cc.codes().includes(value)) {
    return 'is not a valid ISO4217 code'
  }
}

module.exports = WorldpayBase
