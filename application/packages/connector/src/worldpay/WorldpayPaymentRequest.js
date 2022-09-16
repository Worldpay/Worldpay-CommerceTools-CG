'use strict'

const WorldpayBase = require('./WorldpayBase')
const WorldpayAmount = require('./WorldpayAmount')
const WorldpayShopper = require('./WorldpayShopper')
const WorldpayAddress = require('./WorldpayAddress')
const WorldpayCreateTokenData = require('./WorldpayCreateTokenData')
const WorldpayPaymentMethodMask = require('./WorldpayPaymentMethodMask')
const WorldpayAuthenticationRiskData = require('./WorldpayAuthenticationRiskData')
const WorldpayShopperAccountRiskData = require('./WorldpayShopperAccountRiskData')
const WorldpayTransactionRiskData = require('./WorldpayTransactionRiskData')
const WorldpayFraudSightData = require('./WorldpayFraudSightData')
const constants = require('./constants')
const _ = require('lodash')
const WorldpayOrderLines = require('./WorldpayOrderLines')
const WorldpayExemptionRequest = require('./WorldpayExemptionRequest')

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

  validate() {
    let results = super.validate()
    if (this.paymentMethodMask && this.paymentDetails) {
      _.concat(results, { paymentMethodMask: ['Either paymentMethodMask or paymentDetails are allowed, not both'] })
    }
    if (!this.paymentDetails && !this.paymentMethodMask) {
      _.concat(results, { paymentMethodMask: ['Unless paymentDetails is defined, paymentMethodMask is required'] })
    }
    if (this.shopper && this.paymentDetails) {
      _.concat(results, { shopper: ['Either shopper or paymentDetails are allowed, not both'] })
    }
    if (!this.paymentDetails && !this.shopper) {
      _.concat(results, { shopper: ['Unless paymentDetails is defined, shopper is required'] })
    }
    return results
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

  withShopperLanguageCode(shopperLanguageCode) {
    this.orderShopperLanguageCode = shopperLanguageCode
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
    if (shopper && !(shopper instanceof WorldpayShopper)) {
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

  withOrderLines(orderLines) {
    if (!(orderLines instanceof WorldpayOrderLines)) {
      throw new Error('Order lines should be a WorldpayOrderLines')
    }
    this.orderLines = orderLines
    return this
  }
  withPaymentMethodMask(paymentMethodMask) {
    if (paymentMethodMask && !(paymentMethodMask instanceof WorldpayPaymentMethodMask)) {
      throw new Error('paymentMethodMask should be of type WorldpayPaymentMethodMask')
    }
    this.paymentMethodMask = paymentMethodMask
    return this
  }

  withPaymentDetails(paymentDetails) {
    if (paymentDetails && typeof paymentDetails !== 'object') {
      throw new Error('paymentDetails should be of type WorldpayPaymentDetails')
    }
    this.paymentDetails = paymentDetails
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

  withExemptionRequest(exemptionRequest) {
    if (!(exemptionRequest instanceof WorldpayExemptionRequest)) {
      throw new Error('exemptionRequest should be of type WorldpayExemptionRequest')
    }
    this.exemptionRequest = exemptionRequest
    return this
  }

  withFraudSightData(fraudSightData) {
    if (!(fraudSightData instanceof WorldpayFraudSightData)) {
      throw new Error('fraudSightData should be of type WorldpayFraudSightData')
    }
    this.fraudSightData = fraudSightData
    return this
  }

  withCreateTokenData(createTokenData) {
    if (!(createTokenData instanceof WorldpayCreateTokenData)) {
      throw new Error('createToken should be of type WorldpayCreateTokenData')
    }
    this.createTokenData = createTokenData
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
    const transactionRiskDataXml = this.transactionRiskData ? this.transactionRiskData.buildXmlData() : undefined

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
      '@shopperLanguageCode': this.orderShopperLanguageCode ?? undefined,
      description: this.orderDescription ?? undefined,
      ...this.amount.buildXmlData(),
      orderContent: this.orderContent ? { $: this.orderContent } : undefined,
      ...this.paymentMethodMask?.buildXmlData(),
      paymentDetails: this.paymentDetails?.buildXmlData(),
      ...this.shopper?.buildXmlData(),
      shippingAddress: this.shippingAddress ? this.shippingAddress.buildXmlData() : undefined,
      billingAddress: this.billingAddress ? this.billingAddress.buildXmlData() : undefined,
      ...(this.createTokenData && this.createTokenData.buildXmlData()),
      orderLines: this.orderLines ? this.orderLines.buildXmlData() : undefined,
      ...this.buildRiskData(),
      ...(this.exemptionRequest && this.exemptionRequest.buildXmlData()),
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
}

module.exports = WorldpayPaymentRequest
