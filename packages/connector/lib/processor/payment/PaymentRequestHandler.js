'use strict'

const axios = require('axios')
const _ = require('lodash')
const { Headers, MimeTypes } = require('http-headers-js')
const log = require('../../utils/log')
const PaymentOrderBuilder = require('./PaymentOrderBuilder')
const PaymentProcessorException = require('./PaymentProcessorException')
const WorldpayPaymentResponse = require('../../worldpay/WorldpayPaymentResponse')
const xmlBuilder = require('../../worldpay/xmlBuilder')

const {
  PAYMENT_INTERFACE_INTERACTION_TYPE_KEY,
  PAYMENT_TYPE_KEY,
  PAYMENT_METHOD,
} = require('./constants')
const { codes: errorCodes } = require('./errors')

class PaymentRequestHandler {
  constructor(commercetoolsClient, options, project, orderBuilder) {
    this.commercetoolsClient = commercetoolsClient
    this.options = options
    this.project = project
    this.orderBuilder = orderBuilder || new PaymentOrderBuilder(this.options, this.project)
  }

  /**
   * Process the request
   *
   * @param {object} payload The payload from Commercetools
   * @param {object} headers Relevant HTTP headers
   * @returns {Promise<string>}
   */
  async process(payload, headers) {
    log.silly('`process` parameters', { payload, headers })
    this.cart = await this.getCart(payload)
    this.customer = await this.getCustomer(payload)
    const { xmlMessage, response } = await this.sendWorldpayXml(
      this.cart,
      this.customer,
      payload,
      headers
    )
    const actions = this.buildCommercetoolsActions(this.cart, payload, xmlMessage, response)
    return JSON.stringify({ actions })
  }

  /**
   * Get the active cart for this payload
   *
   * The payment may have been generated for a logged in customer, in which
   * case we can use the customer id to find the cart, but if the customer
   * is anonymous we need to use the anonymousId. Only one of these should
   * exist on the payload.
   *
   * @param {object} payload The payload delivered to the extension
   * @returns {Promise<{}>}
   */
  async getCart(payload) {
    const cartId = _.get(payload, 'resource.obj.custom.fields.cartId')
    const cart = await this.commercetoolsClient.getCartById(cartId)

    if (!cart) {
      throw new PaymentProcessorException([{ code: errorCodes.NO_CART, info: { cartId } }])
    }
    return cart
  }

  /**
   * Get the customer for this payload
   *
   * If the payload is from an anonymous customer then we just return null,
   * otherwise we get the customer's details from Commercetools and return those.
   *
   * @param {object} payload The payload delivered to the extension
   * @returns {Promise<{object}|null>}
   */
  async getCustomer(payload) {
    let customer

    const customerId = _.get(payload, 'resource.obj.customer.id', '')
    if (!customerId) {
      return null
    }

    customer = await this.commercetoolsClient.getCustomerById(customerId)
    if (!customer) {
      throw new PaymentProcessorException([
        { code: errorCodes.NO_SUCH_CUSTOMER, info: { customerId } },
      ])
    }
    return customer
  }

  /**
   * Construct the XML data to send to Worldpay and return the response
   *
   * The `response` property on the return object contains the following properties:
   *   - status: HTTP status code
   *   - headers: list of HTTP headers
   *   - data: the response body
   *
   * @param {object} cart The Commercetools cart object
   * @param {object|null} customer The Commercetools customer profile object
   * @param {object} payload The payload delivered to the extension
   * @param {object} headers Key/value pairs representing relevant HTTP headers
   * @returns {Promise<{}>}
   */
  async sendWorldpayXml(cart, customer, payload, headers) {
    const xmlMessage = this.buildXmlMessage(cart, customer, payload, headers)
    // From this point on, we're expecting to return a 200 response to Commercetools
    const response = await this.postMessageToWorldpay(xmlMessage)
    return { xmlMessage, response: _.pick(response, ['status', 'headers', 'data', 'isError']) }
  }

  /**
   * Build the XML message string
   *
   * @param {object} cart The customer's active cart
   * @param {object|null} customer The Commercetools customer profile object
   * @param {object} payload The payload delivered to the extension
   * @param {object} headers HTTP headers
   * @returns {string}
   */
  buildXmlMessage(cart, customer, payload, headers) {
    const xmlRequest = this.orderBuilder.build(cart, customer, payload, {
      userAgent: headers['user-agent'],
      accept: headers['accept'],
    })
    return xmlBuilder.buildWorldpayXml(xmlRequest)
  }

  /**
   * Take the given XML and POST it to Worldpay's server
   *
   * @param {string} xml XML string to send
   * @returns {Promise<*>}
   */
  async postMessageToWorldpay(xml) {
    let response
    log.silly('Sending XML to Worldpay', {
      endpoint: this.options.endpoint,
      xml,
    })
    try {
      response = await this.makeRequest(this.options.endpoint, xml, {
        auth: {
          username: this.options.xmlUsername,
          password: this.options.xmlPassword,
        },
        headers: {
          [Headers.CONTENT_TYPE]: MimeTypes.Text.XML,
        },
        timeout: this.options.timeout,
        validateStatus: (status) => status === 200,
      })
    } catch (e) {
      log.error('Worldpay responded unexpectedly', { exception: e.toJSON(), xml })
      response = { data: e.toJSON(), isError: true }
    }
    return response
  }

  /**
   * Return a list of update actions to return to Commercetools
   *
   * @param {object} cart The customer's active cart
   * @param {object} payload The payment object payload
   * @param {string} xmlMessage The XML string sent to Worldpay
   * @param {object} response
   * @returns []
   */
  buildCommercetoolsActions(cart, payload, xmlMessage, response) {
    const actions = []

    // Add interface interaction to log request/response - this should happen regardless
    // of whether the response from Worldpay was an error or not
    actions.push(this.getAddInterfaceInteractionAction(xmlMessage, response))

    if (response.isError) {
      return actions
    }

    // Stop processing if the XML returned by Worldpay isn't as expected
    const xmlResponseObject = this.extractXmlData(response, {
      orderCode: payload.resource.id,
      merchantCode: this.options.merchantCode,
    })
    if (!xmlResponseObject) {
      return actions
    }

    // If there wasn't an error, we can also add actions for updating the payment 'redirectUrl' and 'orderCode' custom fields
    // as well as adding a transaction of type 'Authorization' and status 'Initial'

    actions.push(this.getSetCustomFieldAction('worldpayOrderCode', xmlResponseObject.orderCode))
    actions.push(this.getSetCustomFieldAction('redirectUrl', xmlResponseObject.redirectUrl))
    actions.push(this.getSetCustomFieldAction('referenceId', xmlResponseObject.referenceId))
    actions.push(this.getSetCustomFieldAction('merchantCode', this.options.merchantCode))
    actions.push(this.getSetCustomFieldAction('installationId', this.options.installationId))
    actions.push(this.getSetInterfaceIdAction(xmlResponseObject.referenceId))
    actions.push(this.getSetMethodInfoNameAction())
    actions.push(this.getSetStatusInterfaceCodeAction())
    actions.push(this.getAddTransactionAction(cart.totalPrice))

    return actions
  }

  /**
   * Extract the the relevant data from the XML response
   *
   * @param response
   * @param expectedValues
   * @returns {object}
   */
  extractXmlData(response, expectedValues) {
    const responseParser = new WorldpayPaymentResponse()
    try {
      responseParser.fromXmlData(response.data)
      const errors = responseParser.validate()
      if (!_.isEmpty(errors)) {
        log.error('Validation errors extracting Worldpay XML', { errors })
        return false
      }
    } catch (e) {
      log.error('Unable to extract Worldpay XML', { errors: e.toString(), response })
      return false
    }

    if (expectedValues.merchantCode !== responseParser.merchantCode) {
      log.error('Worldpay XML response does not match on merchant code', response)
      return false
    }
    if (expectedValues.orderCode !== responseParser.orderCode) {
      log.error('Worldpay XML response does not match on order code', response)
      return false
    }

    return {
      orderCode: _.unescape(responseParser.orderCode),
      referenceId: _.unescape(responseParser.referenceId),
      redirectUrl: _.unescape(responseParser.referenceValue),
    }
  }

  getSetCustomTypeAction(fields) {
    return {
      action: 'setCustomType',
      type: {
        key: PAYMENT_TYPE_KEY,
      },
      fields,
    }
  }

  /**
   * Get the 'AddInterfaceInteraction' action object
   *
   * @param {string} xmlMessage The XML message sent to Worldpay
   * @param {object} response The response object
   * @returns {object}
   */
  getAddInterfaceInteractionAction(xmlMessage, response) {
    return {
      action: 'addInterfaceInteraction',
      type: {
        key: PAYMENT_INTERFACE_INTERACTION_TYPE_KEY,
      },
      fields: {
        createdAt: new Date().toISOString(),
        request: xmlMessage,
        response: response.data,
      },
    }
  }

  /**
   * Get the 'SetCustomField' action for the given name/value pair
   *
   * @param {string} name Name of the custom field
   * @param {*} value Value to set the field to
   * @returns {{name: *, action: string, value: *}}
   */
  getSetCustomFieldAction(name, value) {
    return {
      action: 'setCustomField',
      name,
      value,
    }
  }

  /**
   * Get the 'setInterfaceId' action object
   *
   * @returns {{action: string, interfaceId: (string|string)}}
   */
  getSetInterfaceIdAction(id) {
    return {
      action: 'setInterfaceId',
      interfaceId: id,
    }
  }

  /**
   * Get the 'setMethodInfoName' action object
   *
   * @returns {{name: {en: (string|string)}, action: string}}
   */
  getSetMethodInfoNameAction() {
    return {
      action: 'setMethodInfoName',
      name: {
        en: PAYMENT_METHOD,
      },
    }
  }

  /**
   * Get the 'setStatusInterfaceCode' action object
   *
   * @returns {{action: string, interfaceCode: string}}
   */
  getSetStatusInterfaceCodeAction() {
    return {
      action: 'setStatusInterfaceCode',
      interfaceCode: 'INITIAL',
    }
  }

  /**
   * Get the 'AddTransaction' action object
   * @param amount
   * @returns {{action: string, transaction: {amount: *, type: string}}}
   */
  getAddTransactionAction(amount) {
    return {
      action: 'addTransaction',
      transaction: {
        type: 'Authorization',
        state: 'Initial',
        amount,
        timestamp: new Date().toISOString(),
      },
    }
  }

  /**
   * Make the request to Worldpay
   *
   * @param {string} endpoint URL endpoint
   * @param {string} xml XML string to send
   * @param {object} config Axios config
   * @returns {Promise<*>}
   */
  async makeRequest(endpoint, xml, config) {
    return await axios.post(endpoint, xml, config)
  }
}

module.exports = PaymentRequestHandler
