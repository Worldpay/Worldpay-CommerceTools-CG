'use strict'

const _ = require('lodash')
const fetch = require('node-fetch')
const { createRequestBuilder } = require('@commercetools/api-request-builder')
const { createClient } = require('@commercetools/sdk-client')
const { createAuthMiddlewareForClientCredentialsFlow } = require('@commercetools/sdk-middleware-auth')
const { createHttpMiddleware } = require('@commercetools/sdk-middleware-http')
const log = require('@gradientedge/wcc-logger')
const { ResponseCodes } = require('http-headers-js')

const MAX_ATTEMPTS = 5

/**
 * Commercetools Client
 *
 * Simple wrapper class around the various Commercetools packages.
 *
 */
class CommercetoolsClient {
  /**
   * Constructor
   *
   * Initialise the request builder, auth middleware, http middleware
   * and ultimately the client.
   *
   * The config object should be an object with the following properties:
   *
   *  - projectKey
   *  - authUrl
   *  - apiUrl
   *  - clientId
   *  - clientSecret
   *
   * @param {{}} config Config object
   */
  constructor(config) {
    this.authMiddleware = createAuthMiddlewareForClientCredentialsFlow({
      host: config.authUrl,
      projectKey: config.projectKey,
      credentials: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      },
      fetch,
    })

    this.httpMiddleware = createHttpMiddleware({
      host: config.apiUrl,
      fetch,
    })

    this.client = createClient({
      middlewares: [this.authMiddleware, this.httpMiddleware],
    })

    this.config = config
  }

  /**
   * Get an instance of the Commercetools api-request-builder
   *
   * @returns {*}
   */
  get requestBuilder() {
    return createRequestBuilder({ projectKey: this.config.projectKey })
  }

  /**
   * Get a customer by their ID
   *
   * @param {string} id Customer's Commercetools ID
   * @returns {Promise<{}>}
   */
  getCustomerById(id) {
    const uri = this.requestBuilder.customers.byId(id).build()
    return this.execute({
      uri,
      method: 'GET',
    })
  }

  /**
   * Set customer properties based on the received actions
   *
   * @param {object} customer The customer to update
   * @param {object} customerActions The actions to run on the Customer
   */
  setCustomersActions(customer, customerActions) {
    const uri = this.requestBuilder.customers.byId(customer.id).build()

    return this.execute({
      uri,
      method: 'POST',
      body: {
        version: customer.version,
        actions: customerActions,
      },
    })
  }

  /**
   * Get a cart given a cart id
   *
   * @param {string} id Cart id
   * @returns {Promise<{}>}
   */
  getCartById(id) {
    const uri = this.requestBuilder.carts.byId(id).build()
    return this.execute({
      uri,
      method: 'GET',
    })
  }

  /**
   * Get a payment object by ID
   **
   * @param {string} id Payment object ID
   * @returns {Promise<{}>}
   */
  getPaymentById(id) {
    const uri = this.requestBuilder.payments.byId(id).build()
    return this.execute({
      uri,
      method: 'GET',
    })
  }

  /**
   * Add a new interface interaction to a payment object
   *
   * @param {object} payment The payment object to add the interface interaction to
   * @param {object} typeDefinition The type and associated data {@see https://docs.commercetools.com/api/projects/custom-fields#customfields}
   */
  addInterfaceInteractionToPayment(payment, typeDefinition) {
    const uri = this.requestBuilder.payments.byId(payment.id).build()
    const actions = [{ action: 'addInterfaceInteraction', ...typeDefinition }]

    return this.execute({
      uri,
      method: 'POST',
      body: {
        version: payment.version,
        actions,
      },
    })
  }

  /**
   * Add a transaction to a payment
   *
   * @param {object} payment The commercetools payment object
   * @param {string} transactionId The id of the transaction to change the state of
   * @param {string} state The state to update the transaction to
   * @returns {Promise<{}>}
   */
  changePaymentTransactionState(payment, transactionId, state) {
    const uri = this.requestBuilder.payments.byId(payment.id).build()
    const actions = [
      {
        action: 'changeTransactionState',
        transactionId,
        state,
      },
    ]

    return this.execute({
      uri,
      method: 'POST',
      body: {
        version: payment.version,
        actions,
      },
    })
  }

  /**
   * Add a transaction to a payment
   *
   * @param {object} payment The commercetools payment object
   * @param {object} transaction The transaction to add to the payment
   * @returns {Promise<{}>}
   */
  addPaymentTransaction(payment, transaction) {
    const uri = this.requestBuilder.payments.byId(payment.id).build()
    const actions = [
      {
        action: 'addTransaction',
        transaction: {
          ...transaction,
          timestamp: new Date().toISOString(),
        },
      },
    ]

    return this.execute({
      uri,
      method: 'POST',
      body: {
        version: payment.version,
        actions,
      },
    })
  }

  /**
   * Apply a list of actions to am order object
   *
   * @param {object} order The commercetools order object
   * @param {array} actions Array of payment object actions
   * @returns {Promise<{}>}
   */
  applyOrderActions(order, actions) {
    const uri = this.requestBuilder.orders.byId(order.id).build()

    return this.execute({
      uri,
      method: 'POST',
      body: {
        version: order.version,
        actions,
      },
    })
  }

  /**
   * Apply a list of actions to a payment object
   *
   * @param {object} payment The commercetools payment object
   * @param {array} actions Array of payment object actions
   * @returns {Promise<{}>}
   */
  applyPaymentActions(payment, actions) {
    const uri = this.requestBuilder.payments.byId(payment.id).build()

    return this.execute({
      uri,
      method: 'POST',
      body: {
        version: payment.version,
        actions,
      },
    })
  }

  /**
   * Get an order object by an associated payment id
   *
   * @param {string} paymentId The payment id to search on
   * @returns {Promise<{}>}
   */
  async getOrderByPaymentId(paymentId) {
    const uri = this.requestBuilder.orders.where(`paymentInfo(payments(id="${paymentId}"))`).build()
    const response = await this.execute({
      uri,
      method: 'GET',
    })
    return _.get(response, 'results[0]', null)
  }

  /**
   * Get an order by ID
   *
   * @param {string} id The order ID
   * @returns {Promise<{}>}
   */
  getOrderById(id) {
    const uri = this.requestBuilder.orders.byId(id).build()
    return this.execute({
      uri,
      method: 'GET',
    })
  }

  /**
   * Create an order from a cart id
   *
   * @param {string} cartId The cart id
   */
  async createOrderFromCartId(cartId) {
    let order
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const cart = await this.getCartById(cartId)
      if (!cart) {
        log.error(`Unable to create order from cart. No such cart id: ${cartId}`, { cartId })
        throw new Error(`Unable to create order from cart. No such cart id: ${cartId}`)
      }
      const uri = this.requestBuilder.orders.build()
      try {
        log.debug(`Making attempt ${attempt} to create order from cart`, {
          id: cart.id,
          version: cart.version,
        })

        order = await this.execute({
          uri,
          method: 'POST',
          body: {
            id: cart.id,
            version: cart.version,
          },
        })

        log.debug(`Created order from cart`, { order })
        break
      } catch (e) {
        if (e.statusCode !== ResponseCodes.CONFLICT) {
          throw e
        }
        log.debug(`Attempt ${attempt} to create order from cart failed`, {
          id: cart.id,
          version: cart.version,
          statusCode: e.statusCode,
        })
      }
    }
    return order
  }

  /**
   * Execute a request
   *
   * Calls the underlying Commercetools client's executed method,
   * passing through whatever options were passed in.
   *
   * When we receive a response which has a status code that is not
   * in the 2XX series, then it should almost always result in an
   * exception being thrown. The edge case is where the request is
   * to GET an item, and a 404 response is received. In this
   * scenario we simply return a null value.
   *
   * @param {{}} options
   * @returns {Promise<{}>}
   */
  async execute(options) {
    let response
    let statusCode

    log.debug('Commercetools request', { commercetoolsRequest: options })

    try {
      response = await this.client.execute(options)
    } catch (e) {
      if (options.method === 'GET' && e.statusCode === 404) {
        return null
      }
      log.error('Error response from Commercetools', { err: e })
      throw e
    }

    if (!response.hasOwnProperty('statusCode')) {
      log.error('Missing status code in Commercetools response', { response })
      throw new Error('Missing status code in Commercetools response')
    }
    statusCode = parseInt(response.statusCode, 10)
    if (statusCode < 200 || statusCode >= 300) {
      log.error('Unexpected status code in Commercetools response', { response })
      throw new Error(`Unexpected status code ${response.statusCode} in Commercetools response`)
    }

    if (response.hasOwnProperty('body')) {
      return response.body
    }
    return null
  }
}

module.exports = CommercetoolsClient
