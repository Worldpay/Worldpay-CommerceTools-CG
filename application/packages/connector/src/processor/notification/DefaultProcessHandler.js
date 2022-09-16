'use strict'

const _ = require('lodash')
const { ResponseCodes } = require('http-headers-js')
const log = require('@gradientedge/wcc-logger')
const { WORLDPAY_NOTIFICATION_TYPES } = require('../../worldpay/constants')
const { COMMERCETOOLS } = require('../../constants')
const { WORLDPAY_PAYMENT_STATES_MAP, PAYMENT_TRANSACTION_STATES, PAYMENT_TRANSACTION_TYPES } = COMMERCETOOLS

const MAX_ATTEMPTS = 5
const GET_ORDER_MAX_ATTEMPTS = 5
const GET_ORDER_RETRY_INTERVAL_SECONDS = 5
const CREATE_ORDER_MAX_ATTEMPTS = 5
const CREATE_ORDER_RETRY_INTERVAL_SECONDS = 2

/**
 * If a Worldpay notification comes in and has one of the following status
 * values, then we shouldn't create an order if one doesn't already exist.
 * @type {string[]}
 */
const ORDERABLE_PAYMENT_STATUS = [WORLDPAY_NOTIFICATION_TYPES.CAPTURED, WORLDPAY_NOTIFICATION_TYPES.AUTHORISED]

class DefaultProcessHandler {
  /**
   * Constructor
   *
   * @param {CommercetoolsClient} commercetoolsClient commercetools client
   * @param {object} options Config object
   */
  constructor(commercetoolsClient, options) {
    this.commercetoolsClient = commercetoolsClient
    this.options = options
    this.maxAttempts = this.options.maxAttempts || MAX_ATTEMPTS
  }

  /**
   * Handle the process of the notification
   *
   * @param {WorldpayNotification} notification The notification object
   * @param {object} storageResult The result from the storage processor
   * @returns {null}
   */
  async execute(notification, storageResult) {
    log.debug('Processing notification...', { notification, storageResult })

    let payment
    let order

    if (storageResult) {
      payment = storageResult
    } else {
      payment = await this.getPaymentObject(notification.orderCode)
    }

    order = await this.getOrderByPaymentId(payment.id)

    try {
      payment = await this.applyPaymentActions(notification, payment)
    } catch (e) {
      log.error('Error applying payment actions in notification process handler', { err: e })
    }

    if (!order && ORDERABLE_PAYMENT_STATUS.includes(payment.paymentStatus?.interfaceCode)) {
      log.info(
        `No order found for payment id [${payment.id}]. Creating order based on cart id associated with payment object`,
        { payment },
      )
      order = await this.createOrderFromPayment(payment)
    }

    if (order) {
      try {
        await this.applyOrderActions(notification, order)
      } catch (e) {
        log.error('Error applying order actions in notification process handler', { err: e })
      }
    } else {
      log.debug('No order actions processed as no order currently exists for this notification/payment', {
        paymentId: payment.id,
        notificationType: notification.type,
      })
    }

    if (notification.token) {
      try {
        await this.applyTokenActions(notification, order)
      } catch (e) {
        log.error('Error applying tokenised card actions in notification process handler', { err: e })
      }
    } else {
      log.debug('No tokenised card in this notification/payment', {
        paymentId: payment.id,
        notificationType: notification.type,
      })
    }
  }

  async getOrderByPaymentId(paymentId) {
    for (let i = 1; i <= GET_ORDER_MAX_ATTEMPTS; i++) {
      const order = await this.commercetoolsClient.getOrderByPaymentId(paymentId)
      if (order) {
        log.debug(`Retrieved order associated with payment on attempt ${i}`, { paymentId, order })
        return order
      } else {
        log.error(`Unable to find order by payment id on attempt ${i}`, { paymentId })
      }
      await new Promise((r) => setTimeout(r, GET_ORDER_RETRY_INTERVAL_SECONDS * 1000))
    }
  }

  async createOrderFromPayment(payment) {
    const cartId = _.get(payment, 'custom.fields.cartId', null)
    if (!cartId) {
      log.error('Cannot create order from payment. No cartId on payment object', { payment })
      throw new Error('Cannot create order from payment. No cartId on payment object')
    }

    for (let i = 1; i <= CREATE_ORDER_MAX_ATTEMPTS; i++) {
      let order = await this.commercetoolsClient.getOrderByPaymentId(payment.id)
      if (order) {
        log.debug(`Order found on attempt ${i} of creating order`, {
          paymentId: payment.id,
          order,
        })
        return order
      } else {
        try {
          return this.commercetoolsClient.createOrderFromCartId(cartId)
        } catch (e) {
          log.error(`Unable to create order from cart id [${cartId}] on attempt ${i}`, {
            paymentId: payment.id,
            error: e,
          })
        }
      }
      await new Promise((r) => setTimeout(r, CREATE_ORDER_RETRY_INTERVAL_SECONDS * 1000))
    }

    return this.commercetoolsClient.createOrderFromCartId(cartId)
  }

  async applyPaymentActions(notification, payment) {
    let currentPayment = payment
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      const paymentActions = [
        ...this.generatePaymentInteractionUpdateActions(currentPayment, notification),
        ...this.generatePaymentTransactionActions(currentPayment, notification),
      ]
      if (paymentActions.length === 0) {
        break
      }
      try {
        log.debug('Applying payment actions', { currentPayment: currentPayment, paymentActions })
        await this.commercetoolsClient.applyPaymentActions(currentPayment, paymentActions)
        break
      } catch (e) {
        if (e.statusCode !== ResponseCodes.CONFLICT) {
          throw e
        }
        log.debug(`Attempt ${attempt} to apply payment actions`, {
          payment: currentPayment,
          paymentActions,
        })
        try {
          currentPayment = await this.commercetoolsClient.getPaymentById(currentPayment.id)
          log.debug(`Retrieved updated payment`, { payment: currentPayment })
        } catch (e) {
          log.error('Unable to get latest payment object')
          throw e
        }
      }
      await new Promise((r) => setTimeout(r, 50))
    }
    return currentPayment
  }

  async applyOrderActions(notification, order) {
    let currentOrder = order
    for (let attempt = 1; attempt <= this.maxAttempts; attempt++) {
      const orderActions = [...this.generateOrderPaymentStateChangeActions(notification)]
      if (orderActions.length === 0) {
        break
      }
      try {
        await this.commercetoolsClient.applyOrderActions(currentOrder, orderActions)
        break
      } catch (e) {
        if (e.statusCode !== ResponseCodes.CONFLICT) {
          throw e
        }
        log.debug(`Attempt ${attempt} to apply order actions`, {
          order: currentOrder,
          orderActions,
        })
        try {
          currentOrder = await this.commercetoolsClient.getOrderById(currentOrder.id)
        } catch (e) {
          log.error('Unable to get latest order object')
          throw e
        }
      }
      await new Promise((r) => setTimeout(r, 50))
    }
    return currentOrder
  }

  async applyTokenActions(notification) {
    let token = notification.token
    let customerId = token.authenticatedShopperID
    let customer
    let customerCards
    try {
      customer = await this.commercetoolsClient.getCustomerById(customerId)
      if (!customer) {
        log.warn(`Cannot store tokenised card, customer with id [${customerId}] not found`)
        return
      }
      customerCards = customer.custom?.fields?.tokenisedCards ?? []
    } catch (e) {
      log.error(`Cannot store tokenised card, customer with id [${customerId}] not found`, { error: e })
    }

    const customCard = this.buildTokenisedCard(token)
    if (!customCard) {
      log.warn(`Error creating a serialized version of the token [${token.id}] for customer id [${customerId}] `)
      return
    }

    log.debug(`Tokenised card created`, customCard)
    customerCards.push(JSON.stringify(customCard))
    const actions = this.generateSetTokenisedCardsActions(customerCards)
    let customerUpdated = await this.commercetoolsClient.setCustomersActions(customer, actions)
    log.debug(`Customer updated with tokenised cards`, customerUpdated)
  }

  /**
   * Create a new token item with the information received from WorldPay. Deliberately leaving out address information due to PCI compliance regulations
   *
   * @param token The token
   * @returns {object}
   */
  buildTokenisedCard(token) {
    let cardDetails = token.paymentInstrument.cardDetails.derived
    let tokenDetails = token.tokenDetails
    return {
      paymentTokenId: tokenDetails.paymentTokenID,
      tokenEventReference: token.tokenEventReference,
      tokenReason: token.tokenReason,
      paymentTokenExpiry: new Date(
        tokenDetails.paymentTokenExpiry.date['@year'],
        tokenDetails.paymentTokenExpiry.date['@month'] - 1,
        tokenDetails.paymentTokenExpiry.date['@dayOfMonth'],
      ),
      cardBrand: cardDetails.cardBrand,
      cardSubBrand: cardDetails.cardSubBrand,
      issuerCountryCode: cardDetails.issuerCountryCode,
      obfuscatedPAN: cardDetails.obfuscatedPAN,
      bin: cardDetails.bin,
    }
  }

  /**
   * Returns an array of customer actions to update his/hers tokenised cards
   *
   * @param {} tokenisedCards The tokenisedCards object
   * @returns {array}
   */
  generateSetTokenisedCardsActions(tokenisedCards) {
    if (!tokenisedCards) {
      return []
    }
    return [
      {
        action: 'setCustomType',
        type: {
          key: 'customer-tokenised-cards',
        },
        fields: {
          tokenisedCards,
        },
      },
    ]
  }

  /**
   * Retrieve the payment object from commercetools
   *
   * @param {string} paymentId The payment id to retrieve
   * @returns {Promise<{}>}
   */
  async getPaymentObject(paymentId) {
    let payment = await this.commercetoolsClient.getPaymentById(paymentId)
    if (!payment) {
      throw new Error(`Payment object with id '${paymentId}' not found relating to notification`)
    }
    return payment
  }

  /**
   * Returns an array of payment actions to update the payment interface text and code
   *
   * @param {WorldpayNotification} notification The notification object
   * @returns {array}
   */
  generateOrderPaymentStateChangeActions(notification) {
    const paymentState = WORLDPAY_PAYMENT_STATES_MAP[notification.type]
    if (!paymentState) {
      return []
    }
    return [
      {
        action: 'changePaymentState',
        paymentState,
      },
    ]
  }

  /**
   * Returns an array of payment actions to update the payment interface text and code
   *
   * @param {object} payment The commercetools payment object
   * @param {WorldpayNotification} notification The notification object
   * @returns {array}
   */
  generatePaymentInteractionUpdateActions(payment, notification) {
    let notificationType = notification.type

    // We need to look at using commercetools' state machine for this
    if (
      payment.paymentStatus.interfaceCode !== PAYMENT_TRANSACTION_STATES.INITIAL &&
      notificationType === WORLDPAY_NOTIFICATION_TYPES.SENT_FOR_AUTHORISATION
    ) {
      return []
    }
    return [
      {
        action: 'setStatusInterfaceCode',
        interfaceCode: notification.type,
      },
      {
        action: 'setStatusInterfaceText',
        interfaceText: notification.type,
      },
    ]
  }

  /**
   * Returns an array of payment actions to update the payment interface text and code
   *
   * @param {object} payment The commercetools payment object
   * @param {WorldpayNotification} notification The notification object
   * @returns {array}
   */
  generatePaymentTransactionActions(payment, notification) {
    const actions = []
    const funcName = `generatePaymentActionsFor${this.toCamel(notification.type)}`

    if (!_.isFunction(this[funcName])) {
      log.info(
        `Unable to handle notification type: [${notification.type}], expected method missing: [${funcName}] - ignoring`,
        {
          notification,
          payment,
        },
      )
      return actions
    }

    const result = this[funcName](payment, notification)

    if (result.update) {
      actions.push(
        ...result.update.map((item) => ({
          action: 'changeTransactionState',
          transactionId: item.id,
          state: item.state,
        })),
      )
    }

    if (result.create) {
      actions.push(
        ...result.create.map((item) => ({
          action: 'addTransaction',
          transaction: {
            ...item,
            timestamp: new Date().toISOString(),
          },
        })),
      )
    }

    log.debug('Payment transaction actions', { result, actions })

    return actions
  }

  // eslint-disable-next-line no-unused-vars
  generatePaymentActionsForShopperRedirected(payment, notification) {
    // The shopper is redirected. This is expected for certain payment methods (i.e. Klarna and iDEAL) and should
    // not lead to any payment modifications on commercetools.
    return {}
  }

  generatePaymentActionsForSentForAuthorisation(payment, notification) {
    const existingTransactions = payment.transactions.filter(
      (transaction) => transaction.type === PAYMENT_TRANSACTION_TYPES.AUTHORIZATION,
    )
    if (existingTransactions.length) {
      const initialTransactions = existingTransactions.filter(
        (transaction) => transaction.state === PAYMENT_TRANSACTION_STATES.INITIAL,
      )
      if (initialTransactions.length) {
        return {
          update: initialTransactions.map((transaction) => ({
            id: transaction.id,
            state: PAYMENT_TRANSACTION_STATES.PENDING,
          })),
        }
      } else {
        return {}
      }
    }
    return {
      create: [
        {
          type: PAYMENT_TRANSACTION_TYPES.AUTHORIZATION,
          state: PAYMENT_TRANSACTION_STATES.PENDING,
          amount: notification.amount,
        },
      ],
    }
  }

  generatePaymentActionsForAuthorised(payment, notification) {
    const existingTransactions = payment.transactions.filter(
      (transaction) => transaction.type === PAYMENT_TRANSACTION_TYPES.AUTHORIZATION,
    )
    if (existingTransactions.length) {
      const initialTransactions = existingTransactions.filter(
        (transaction) => transaction.state !== PAYMENT_TRANSACTION_STATES.SUCCESS,
      )
      if (initialTransactions.length) {
        return {
          update: initialTransactions.map((transaction) => ({
            id: transaction.id,
            state: PAYMENT_TRANSACTION_STATES.SUCCESS,
          })),
        }
      }
    }
    return {
      create: [
        {
          type: PAYMENT_TRANSACTION_TYPES.AUTHORIZATION,
          state: PAYMENT_TRANSACTION_STATES.SUCCESS,
          amount: notification.amount,
        },
      ],
    }
  }

  generatePaymentActionsForCaptured(payment, notification) {
    const existingTransactions = payment.transactions.filter(
      (transaction) => transaction.type === PAYMENT_TRANSACTION_STATES.CHARGE,
    )
    if (existingTransactions.length) {
      const initialTransactions = existingTransactions.filter(
        (transaction) => transaction.state === PAYMENT_TRANSACTION_STATES.INITIAL,
      )
      if (initialTransactions.length) {
        return {
          update: initialTransactions.map((transaction) => ({
            id: transaction.id,
            state: PAYMENT_TRANSACTION_STATES.SUCCESS,
          })),
        }
      } else {
        return {}
      }
    }
    return {
      create: [
        {
          type: PAYMENT_TRANSACTION_TYPES.CHARGE,
          state: PAYMENT_TRANSACTION_STATES.SUCCESS,
          amount: notification.amount,
        },
      ],
    }
  }

  generatePaymentActionsForCancelled(payment, notification) {
    return {
      create: [
        {
          type: PAYMENT_TRANSACTION_TYPES.CANCEL_AUTHORIZATION,
          state: PAYMENT_TRANSACTION_STATES.SUCCESS,
          amount: notification.amount,
        },
      ],
    }
  }

  generatePaymentActionsForRefused(payment, notification) {
    const existingTransactions = payment.transactions.filter(
      (transaction) => transaction.type === PAYMENT_TRANSACTION_TYPES.AUTHORIZATION,
    )
    if (existingTransactions.length) {
      const initialTransactions = existingTransactions.filter(
        (transaction) => transaction.state !== PAYMENT_TRANSACTION_STATES.FAILURE,
      )
      if (initialTransactions.length) {
        return {
          update: initialTransactions.map((transaction) => ({
            id: transaction.id,
            state: PAYMENT_TRANSACTION_STATES.FAILURE,
          })),
        }
      }
    }
    return {
      create: [
        {
          type: PAYMENT_TRANSACTION_TYPES.AUTHORIZATION,
          state: PAYMENT_TRANSACTION_STATES.FAILURE,
          amount: notification.amount,
        },
      ],
    }
  }

  generatePaymentActionsForSentForRefund(payment, notification) {
    return {
      create: [
        {
          type: PAYMENT_TRANSACTION_TYPES.REFUND,
          state: PAYMENT_TRANSACTION_STATES.PENDING,
          amount: notification.amount,
        },
      ],
    }
  }

  generatePaymentActionsForRefunded(payment, notification) {
    const existingTransactions = payment.transactions.filter(
      (transaction) => transaction.type === PAYMENT_TRANSACTION_TYPES.REFUND,
    )
    if (existingTransactions.length) {
      const matchingTransactions = existingTransactions.filter(
        (transaction) =>
          transaction.state === PAYMENT_TRANSACTION_STATES.PENDING &&
          _.isEqual(transaction.amount, notification.amount),
      )
      if (matchingTransactions.length) {
        return {
          update: [
            {
              id: matchingTransactions[0].id,
              state: PAYMENT_TRANSACTION_STATES.SUCCESS,
            },
          ],
        }
      }
    }
    return {
      create: [
        {
          type: PAYMENT_TRANSACTION_TYPES.REFUND,
          state: PAYMENT_TRANSACTION_STATES.SUCCESS,
          amount: notification.amount,
        },
      ],
    }
  }

  generatePaymentActionsForRefundedByMerchant(payment, notification) {
    return this.generatePaymentActionsForRefunded(payment, notification)
  }

  generatePaymentActionsForRefundFailed(payment, notification) {
    const existingTransactions = payment.transactions.filter(
      (transaction) => transaction.type === PAYMENT_TRANSACTION_TYPES.REFUND,
    )
    if (existingTransactions.length) {
      const matchingTransactions = existingTransactions.filter(
        (transaction) =>
          transaction.state === PAYMENT_TRANSACTION_STATES.PENDING &&
          _.isEqual(transaction.amount, notification.amount),
      )
      if (matchingTransactions.length) {
        return {
          update: [
            {
              id: matchingTransactions[0].id,
              state: PAYMENT_TRANSACTION_STATES.FAILURE,
            },
          ],
        }
      }
    }
    return {
      create: [
        {
          type: PAYMENT_TRANSACTION_TYPES.REFUND,
          state: PAYMENT_TRANSACTION_STATES.FAILURE,
          amount: notification.amount,
        },
      ],
    }
  }

  generatePaymentActionsForExpired(payment, notification) {
    return this.generatePaymentActionsForRefused(payment, notification)
  }

  generatePaymentActionsForChargedBack(payment, notification) {
    return {
      create: [
        {
          type: PAYMENT_TRANSACTION_TYPES.CHARGEBACK,
          state: PAYMENT_TRANSACTION_STATES.SUCCESS,
          amount: notification.amount,
        },
      ],
    }
  }

  toCamel(s) {
    return _.upperFirst(_.camelCase(s))
  }
}

module.exports = DefaultProcessHandler
