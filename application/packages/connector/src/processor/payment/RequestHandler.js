'use strict'

const _ = require('lodash')

class RequestHandler {
  constructor() {
    if (this.constructor === RequestHandler) {
      throw new Error("Abstract class, can't be instantiated.")
    }
  }

  /**
   * @returns {string} The name of the processor
   */
  name() {
    throw new Error("Method 'name()' must be implemented.")
  }

  /**
   * Determine whether the processor should deal with this payload
   *
   * @param {object} payload The incoming payload
   * @returns {boolean} Whether to deal with this request or not
   */
  // eslint-disable-next-line no-unused-vars
  isRequestApplicable(payload) {
    throw new Error("Method 'isRequestApplicable()' must be implemented.")
  }

  /**
   * Extract information from the request
   * @param payload: The payload that was received
   * @returns {{resourceTypeId: *, action: *, paymentMethod: *, paymentInterface: *}}
   */
  extractRequestDetails(payload) {
    return {
      action: _.get(payload, 'action'),
      resourceTypeId: _.get(payload, 'resource.typeId'),
      paymentInterface: _.get(payload, 'resource.obj.paymentMethodInfo.paymentInterface'),
      paymentMethod: _.get(payload, 'resource.obj.paymentMethodInfo.method'),
    }
  }

  /**
   * Process the message in case it is applicable
   *
   * @param {object} payload The payload from Commercetools
   * @param {object} headers Object of HTTP headers (lowercase keys)
   * @returns {Promise<[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async process(payload, headers) {
    throw new Error("Method 'dispatchToHandler(payload, headers)' must be implemented.")
  }
}

module.exports = RequestHandler
