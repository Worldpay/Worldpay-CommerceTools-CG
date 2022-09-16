'use strict'

const validate = require('validate.js')
const _ = require('lodash')
const cc = require('currency-codes')

// Options for validator - flat results, and no-op for the prettification of variable values which we don't want
const validateOptions = { format: 'flat', prettify: (msg) => msg }

/**
 * Base class for all Worldpay XML entities
 * Provides validation and utility methods related to Worldpay XML generation
 */
class WorldpayBase {
  constructor(constraints) {
    this.constraints = _.clone(constraints)
  }

  validate() {
    let results = validate(this, this.constraints, validateOptions)

    // Perform validation on any sub-components of this class that also have validation
    // i.e. the PaymentRequest.amount is of type WorldpayAmount which has its own validation
    for (const property in this) {
      if (this[property] instanceof WorldpayBase) {
        results = _.concat(results, validate(this[property], this[property].constraints, validateOptions))
      }
    }
    results = _.compact(results)

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
   * @param {Date} worldpayDate the date to convert to Worldpay format
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
    return `[${value || ''}] is not a valid ISO4217 code`
  }
}

// Define custom regex for email validation - default validate.js validator doesn't allow unicode chars.
/* eslint no-control-regex: "off" -- Control chars are expected as part of the email regex */
validate.validators.email.PATTERN =
  /^((([a-z]|\d|[!#$%&'*+\-/=?^_`{|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#$%&'*+\-/=?^_`{|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i

// Alphanumerical or underscore, max 64 chars
validate.validators.alpha_num_64 = function (value) {
  if (!_.isString(value) || !/^\w{0,64}$/.test(value)) {
    return `[${value}] should have 0..64 alphanumerical or _ characters`
  }
}

module.exports = WorldpayBase
