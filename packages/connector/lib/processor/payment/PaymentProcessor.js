'use strict'

const _ = require('lodash')
const log = require('../../utils/log')
const CommercetoolsClient = require('../../commercetools/Client')
const PaymentRequestHandler = require('./PaymentRequestHandler')
const PaymentOrderBuilder = require('./PaymentOrderBuilder')
const { WORLDPAY_ENVIRONMENTS } = require('../../worldpay/constants')

const { PAYMENT_INTERFACE, PAYMENT_METHOD, DEFAULT_TIMEOUT } = require('./constants')

const REQUIRED_OPTION_PROPS = [
  'merchantCode',
  'installationId',
  'xmlUsername',
  'xmlPassword',
  'macSecret',
  'env',
]

/**
 * Payment processor
 *
 * This class is responsible for taking the API extension data from
 * Commercetools, validating it, communicating with Worldpay to retrieve
 * a redirectUrl and orderCode, and decorating the Commercetools payment
 * object with the necessary additional data.
 */
class PaymentProcessor {
  /**
   * Constructor
   *
   * The `options` parameter must contain the following properties:
   *
   *  - merchantCode: Merchant's Worldpay merchant code
   *  - installationId: Merchant's Worldpay installation ID
   *  - xmlUsername: Basic auth username for communicating with Worldpay
   *  - xmlPassword: Basic auth password for communicating with Worldpay
   *  - macSecret:
   *  - env: Worldpay environment ('test' or 'production')
   *
   *  Optionally, the `options` parameter may contain the following:
   *
   *  - timeout: the timeout when waiting for a response from Worldpay
   *
   *  The `project` param object contains 2 properties used to help
   *  identify the source of the request when communicating with Worldpay.
   *
   *   - key (typically the Commercetools project key)
   *   - version (typically the npm package version)
   *
   * @param {CommercetoolsClient} commercetoolsClient An instance of CommercetoolsClient
   * @param {object} options Configuration options
   * @param {object} project Project details
   */
  constructor(commercetoolsClient, options = {}, project = {}) {
    if (!(commercetoolsClient instanceof CommercetoolsClient)) {
      throw new Error('`commercetoolsClient` parameter must be of type CommercetoolsClient')
    }
    if (_.isEmpty(options)) {
      throw new Error('`options` parameter is missing or empty')
    }
    const validOptions = _.intersection(REQUIRED_OPTION_PROPS, Object.keys(options))
    if (validOptions.length !== REQUIRED_OPTION_PROPS.length) {
      const missingOptionKeys = _.difference(REQUIRED_OPTION_PROPS, Object.keys(options)).join(', ')
      throw new Error('`options` parameter is missing required properties: ' + missingOptionKeys)
    }
    this.commercetoolsClient = commercetoolsClient
    this.options = options
    this.options.endpoint = this.getWorldpayEndpoint()
    this.options.timeout = this.options.timeout || DEFAULT_TIMEOUT
    this.project = project
  }

  /**
   * Handle the processing of the extension API input payload
   *
   * For more details on the `payload` parameter, see:
   * https://docs.commercetools.com/http-api-projects-api-extensions#input
   *
   * @param {object} payload The payload from Commercetools
   * @param {object} headers Object of HTTP headers (lowercase keys)
   * @returns {Promise<{}>}
   */
  execute(payload, headers = {}) {
    if (!this.isRequestApplicable(payload)) {
      log.debug('Request is not applicable', { payload })
      return null
    }
    return this.dispatchToHandler(payload, headers)
  }

  /**
   * Dispatch the incoming request off to the PaymentRequestHandler class
   *
   * @param {object} payload The payload from Commercetools
   * @param {object} headers Object of HTTP headers (lowercase keys)
   * @returns {Promise<{string}>}
   */
  async dispatchToHandler(payload, headers) {
    const requestHandler = new PaymentRequestHandler(
      this.commercetoolsClient,
      this.options,
      this.project,
      new PaymentOrderBuilder(this.options, this.project)
    )
    return await requestHandler.process(payload, headers)
  }

  /**
   * Determine whether the processor should deal with this payload
   *
   * @param {object} payload The incoming payload
   * @returns {boolean} Whether to deal with this request or not
   */
  isRequestApplicable(payload) {
    const action = _.get(payload, 'action')
    const resourceTypeId = _.get(payload, 'resource.typeId')
    const paymentInterface = _.get(payload, 'resource.obj.paymentMethodInfo.paymentInterface')
    const paymentMethod = _.get(payload, 'resource.obj.paymentMethodInfo.method')

    return !(
      resourceTypeId !== 'payment' ||
      action !== 'Create' ||
      paymentInterface !== PAYMENT_INTERFACE ||
      paymentMethod !== PAYMENT_METHOD
    )
  }

  /**
   * Get the appropriate Worldpay endpoint
   *
   * Worldpay has 2 environments: 'test' and 'production'.
   * This method grabs the endpoint from the appropriate constant
   * based on the environment id passed in via the constructor
   * `options` parameter.
   *
   * @returns {string}
   */
  getWorldpayEndpoint() {
    return WORLDPAY_ENVIRONMENTS[this.options.env]
  }
}

module.exports = PaymentProcessor
