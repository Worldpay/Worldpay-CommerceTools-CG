'use strict'

const WorldpayBase = require('./WorldpayBase')
const WorldpayAmount = require('./WorldpayAmount')
const WorldpayShopper = require('./WorldpayShopper')
const WorldpayAddress = require('./WorldpayAddress')
const WorldpayPaymentMethodMask = require('./WorldpayPaymentMethodMask')
const WorldpayAuthenticationRiskData = require('./WorldpayAuthenticationRiskData')
const WorldpayShopperAccountRiskData = require('./WorldpayShopperAccountRiskData')
const WorldpayTransactionRiskData = require('./WorldpayTransactionRiskData')
const WorldpayFraudSightData = require('./WorldpayFraudSightData')
const constants = require('./constants')

/**
 * Worldpay XML PaymentRequest entity - containing order details
 * https://developer.worldpay.com/docs/wpg/hostedintegration/paymentrequests#order-elements
 */
class WorldpayPaymentRequest extends WorldpayBase {
  constructor(merchantCode, installationId) {
    super(constraints)
    this.merchantCode = merchantCode
    this.installationId = installationId
  }

  withOrderDetails(orderCode, orderDescription) {
    this.orderCode = orderCode
    this.orderDescription = orderDescription
    return this
  }

  withCaptureDelay(captureDelay) {
    this.orderCaptureDelay = captureDelay
    return this
  }

  withOrderContent(orderContent) {
    this.orderContent = orderContent
    return this
  }

  withPaymentAmount(amount) {
    if (!(amount instanceof WorldpayAmount)) {
      throw new Error('amount should be a WorldpayAmount')
    }
    this.amount = amount
    return this
  }

  withShopperDetails(shopper) {
    if (!(shopper instanceof WorldpayShopper)) {
      throw new Error('shopper should be a WorldpayShopper')
    }
    this.shopper = shopper
    return this
  }

  withShippingAddress(address) {
    if (!(address instanceof WorldpayAddress)) {
      throw new Error('address should be a WorldpayAddress')
    }
    this.shippingAddress = address
    return this
  }

  withBillingAddress(address) {
    if (!(address instanceof WorldpayAddress)) {
      throw new Error('address should be a WorldpayAddress')
    }
    this.billingAddress = address
    return this
  }

  withPaymentMethodMask(paymentMethodMask) {
    if (!(paymentMethodMask instanceof WorldpayPaymentMethodMask)) {
      throw new Error('paymentMethodMask should be of type WorldpayPaymentMethodMask')
    }
    this.paymentMethodMask = paymentMethodMask
    return this
  }

  withAuthenticationRiskData(authenticationRiskData) {
    if (!(authenticationRiskData instanceof WorldpayAuthenticationRiskData)) {
      throw new Error('authenticationRiskData should be of type WorldpayAuthenticationRiskData')
    }
    this.authenticationRiskData = authenticationRiskData
    return this
  }

  withShopperAccountRiskData(shopperAccountRiskData) {
    if (!(shopperAccountRiskData instanceof WorldpayShopperAccountRiskData)) {
      throw new Error('shopperAccountRiskData should be of type WorldpayShopperAccountRiskData')
    }
    this.shopperAccountRiskData = shopperAccountRiskData
    return this
  }

  withTransactionRiskData(transactionRiskData) {
    if (!(transactionRiskData instanceof WorldpayTransactionRiskData)) {
      throw new Error('transactionRiskData should be of type WorldpayTransactionRiskData')
    }
    this.transactionRiskData = transactionRiskData
    return this
  }

  withFraudSightData(fraudSightData) {
    if (!(fraudSightData instanceof WorldpayFraudSightData)) {
      throw new Error('fraudSightData should be of type WorldpayFraudSightData')
    }
    this.fraudSightData = fraudSightData
    return this
  }

  buildRiskData() {
    if (!this.authenticationRiskData && !this.shopperAccountRiskData && !this.transactionRiskData) {
      return
    }

    const authenticationRiskDataXml = this.authenticationRiskData
      ? this.authenticationRiskData.buildXmlData()
      : undefined
    const shopperAccountRiskDataXml = this.shopperAccountRiskData
      ? this.shopperAccountRiskData.buildXmlData()
      : undefined
    const transactionRiskDataXml = this.transactionRiskData
      ? this.transactionRiskData.buildXmlData()
      : undefined

    const data = {
      riskData: {
        ...authenticationRiskDataXml,
        ...shopperAccountRiskDataXml,
        ...transactionRiskDataXml,
      },
    }
    return data
  }

  buildXmlData() {
    // Build the structure for the order section of the Worldpay XML message
    // Retaining the element ordering here as used within the Worldpay documentation
    // https://developer.worldpay.com/docs/wpg/hostedintegration/paymentrequests
    const order = {
      '@orderCode': this.orderCode,
      '@installationId': this.installationId,
      '@captureDelay': this.orderCaptureDelay,
      description: this.orderDescription,
      ...this.amount.buildXmlData(),
      orderContent: this.orderContent ? { $: this.orderContent } : undefined,
      ...this.paymentMethodMask.buildXmlData(),
      ...this.shopper.buildXmlData(),
      shippingAddress: this.shippingAddress ? this.shippingAddress.buildXmlData() : undefined,
      billingAddress: this.billingAddress ? this.billingAddress.buildXmlData() : undefined,
      ...this.buildRiskData(),
      ...(this.fraudSightData && this.fraudSightData.buildXmlData()),
    }

    // Build the data structure for the entire Worldpay XML message
    const data = {
      paymentService: {
        '@version': constants.WORLDPAY_DTD_VERSION,
        '@merchantCode': this.merchantCode,
        submit: {
          order,
        },
      },
    }

    return data
  }
}

const constraints = {
  merchantCode: {
    presence: true,
  },
  installationId: {
    presence: true,
  },
  orderCode: {
    presence: true,
  },
  orderDescription: {
    presence: true,
  },
  amount: {
    presence: true,
  },
  shopper: {
    presence: true,
  },
  paymentMethodMask: {
    presence: true,
  },
}

module.exports = WorldpayPaymentRequest
