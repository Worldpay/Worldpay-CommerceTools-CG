'use strict'

const _ = require('lodash')
const { detail: errorDetail } = require('./errors')

const compiledErrors = {}
for (const key in errorDetail) {
  compiledErrors[key] = {
    ...errorDetail[key],
    msg: _.template(errorDetail[key].msg),
  }
}

class PaymentProcessorException {
  constructor(errors) {
    this.errors = []
    if (!Array.isArray(errors)) {
      return
    }
    errors.forEach((error) => {
      if (_.isObject(error) && error.code && compiledErrors.hasOwnProperty(error.code)) {
        const populatedError = {
          code: errorDetail[error.code].code,
          message: errorDetail[error.code].msg,
        }
        if (error.info) {
          populatedError.message = compiledErrors[error.code].msg(error.info)
        }
        this.errors.push(populatedError)
      }
    })
  }

  toString() {
    return `Payment processor exception: ${JSON.stringify(this.errors)}`
  }

  toJSON() {
    return {
      errors: this.errors,
    }
  }
}

module.exports = PaymentProcessorException
