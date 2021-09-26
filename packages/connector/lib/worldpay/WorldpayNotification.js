'use strict'

const _ = require('lodash')
const { parseXml } = require('./xmlParser')
const { WORLDPAY_JOURNAL_TYPES: WJT, WORLDPAY_JOURNAL_STATUS: WJS } = require('./constants')

/**
 * Worldpay XML notification - XML notification received from Worldpay following a payment status change
 * https://developer.worldpay.com/docs/wpg/manage/ordernotifications#xml-notifications
 */
class WorldpayNotification {
  constructor(xmlString) {
    this.xmlString = xmlString
    this.xmlObject = this.parseXml(this.xmlString)
    this.extractXmlObjectToProperties(this.xmlObject)
  }

  extractXmlObjectToProperties(xmlObject) {
    if (!xmlObject || !xmlObject.paymentService) {
      throw new Error('Worldpay response XML missing expected paymentService node')
    }
    this.worldpayDtdVersion = xmlObject.paymentService['@version']
    this.merchantCode = xmlObject.paymentService['@merchantCode']

    if (!xmlObject.paymentService.notify) {
      throw new Error('Worldpay response XML missing expected paymentService.notify node')
    }
    if (!xmlObject.paymentService.notify.orderStatusEvent) {
      throw new Error(
        'Worldpay response XML missing expected paymentService.notify.orderStatusEvent node'
      )
    }

    const orderStatusEvent = xmlObject.paymentService.notify.orderStatusEvent
    this.orderCode = orderStatusEvent['@orderCode']
    this.type = orderStatusEvent.journal['@journalType']

    try {
      this.amount = this.determineAmount(this.type, orderStatusEvent)
    } catch (e) {
      this.amount = null
    }
  }

  parseXml(xmlString) {
    return parseXml(xmlString)
  }

  determineAmount(type, orderStatusEvent) {
    let amount
    let accountTx = _.get(orderStatusEvent, 'journal.accountTx', [])

    if (!Array.isArray(accountTx)) {
      if (!accountTx) {
        accountTx = []
      } else {
        accountTx = [accountTx]
      }
    }

    switch (type) {
      case WJT.SENT_FOR_AUTHORISATION:
      case WJT.CANCELLED:
        amount = _.get(orderStatusEvent, 'payment.amount', null)
        break
      case WJT.AUTHORISED:
        amount = _.get(
          accountTx.find((item) => item['@accountType'] === WJS.IN_PROCESS_AUTHORISED),
          'amount',
          null
        )

        break
      case WJT.SETTLED:
        amount = _.get(
          accountTx.find((item) => item['@accountType'] === WJS.SETTLED_BIBIT_NET),
          'amount',
          null
        )
        break
      default:
        amount = _.get(
          accountTx.find((item) => item['@accountType'] === WJS.IN_PROCESS_CAPTURED),
          'amount',
          null
        )
    }

    return this.toMoney(amount)
  }

  toMoney(amount) {
    if (!amount) {
      return null
    }
    return {
      type: 'centPrecision',
      centAmount: parseInt(amount['@value'], 10),
      currencyCode: amount['@currencyCode'],
      fractionDigits: parseInt(amount['@exponent'], 10),
    }
  }
}

module.exports = WorldpayNotification
