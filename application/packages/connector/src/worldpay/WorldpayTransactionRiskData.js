'use strict'

const WorldpayBase = require('./WorldpayBase')
const WorldpayAmount = require('./WorldpayAmount')
const WP = require('./constants')

/**
 * Worldpay Additional Risk Data for 3DS2 as defined here:
 * https://developer.worldpay.com/docs/wpg/authentication/3ds2withhpp#adding-risk-data
 */
class WorldpayTransactionRiskData extends WorldpayBase {
  constructor() {
    super(constraints)
  }

  /**
   * For prepaid or gift card purchase, the purchase amount total of prepaid or gift card(s)
   * in major units (for example, USD 123.45 is 123
   * @param {number} transactionRiskDataGiftCardAmount
   */
  withGiftCardAmount(transactionRiskDataGiftCardAmount) {
    if (!(transactionRiskDataGiftCardAmount instanceof WorldpayAmount)) {
      throw new Error('transactionRiskDataGiftCardAmount should be a WorldpayAmount')
    }

    this.transactionRiskDataGiftCardAmount = transactionRiskDataGiftCardAmount
    return this
  }

  /**
   * For a pre-ordered purchase, the expected date that the merchandise will be available.
   * @param {Date} transactionRiskDataPreOrderDate
   */
  withPreOrderDate(transactionRiskDataPreOrderDate) {
    this.transactionRiskDataPreOrderDate = transactionRiskDataPreOrderDate
    return this
  }

  /**
   * Indicates shipping method chosen for the transaction.
   * @param {string} shippingMethod
   */
  withShippingMethod(shippingMethod) {
    this.shippingMethod = shippingMethod
    return this
  }

  /**
   * Indicates the delivery timeframe.
   * @param {string} deliveryTimeframe
   */
  withDeliveryTimeframe(deliveryTimeframe) {
    this.deliveryTimeframe = deliveryTimeframe
    return this
  }

  /**
   * For electronically delivered goods only. Email address to which the merchandise was delivered.
   * @param {string} deliveryEmailAddress
   */
  withDeliveryEmailAddress(deliveryEmailAddress) {
    this.deliveryEmailAddress = deliveryEmailAddress
    return this
  }

  /**
   * Indicates whether the shopper is reordering previously purchased merchandise.
   * @param {boolean} reorderingPreviousPurchases
   */
  withReorderingPreviousPurchases(reorderingPreviousPurchases) {
    this.reorderingPreviousPurchases = reorderingPreviousPurchases
    return this
  }

  /**
   * Indicates whether shopper is placing an order with a future availability or release date.
   * @param {boolean} preOrderPurchase
   */
  withPreOrderPurchase(preOrderPurchase) {
    this.preOrderPurchase = preOrderPurchase
    return this
  }

  /**
   * Total count of individual prepaid gift cards purchased.
   * @param {number} giftCardCount
   */
  withGiftCardCount(giftCardCount) {
    this.giftCardCount = giftCardCount
    return this
  }

  buildXmlData() {
    if (
      !this.transactionRiskDataGiftCardAmount &&
      !this.transactionRiskDataPreOrderDate &&
      !this.shippingMethod &&
      !this.deliveryTimeframe &&
      !this.deliveryEmailAddress &&
      !this.reorderingPreviousPurchases &&
      !this.preOrderPurchase &&
      !this.giftCardCount
    ) {
      return
    }

    const data = {
      transactionRiskData: {
        transactionRiskDataGiftCardAmount: this.transactionRiskDataGiftCardAmount
          ? this.transactionRiskDataGiftCardAmount.buildXmlData()
          : undefined,
        transactionRiskDataPreOrderDate: this.asWorldpayDate(this.transactionRiskDataPreOrderDate),
        '@shippingMethod': this.shippingMethod,
        '@deliveryTimeframe': this.deliveryTimeframe,
        '@deliveryEmailAddress': this.deliveryEmailAddress,
        '@reorderingPreviousPurchases': this.reorderingPreviousPurchases,
        '@preOrderPurchase': this.preOrderPurchase,
        '@giftCardCount': this.giftCardCount,
      },
    }
    return data
  }
}

// Validation constraints
const constraints = {
  transactionRiskDataPreOrderDate: {
    type: 'date',
  },
  shippingMethod: {
    inclusion: [
      WP.WORLDPAY_SHIPPING_METHOD_SHIP_TO_BILLING_ADDRESS,
      WP.WORLDPAY_SHIPPING_METHOD_SHIP_TO_VERIFIED_ADDRES,
      WP.WORLDPAY_SHIPPING_METHOD_SHIP_TO_OTHER_ADDRESS,
      WP.WORLDPAY_SHIPPING_METHOD_SHIP_TO_STORE,
      WP.WORLDPAY_SHIPPING_METHOD_DIGITAL,
      WP.WORLDPAY_SHIPPING_METHOD_UNSHIPPED_TRAVEL_OR_EVENT_TICKETS,
      WP.WORLDPAY_SHIPPING_METHOD_OTHER,
    ],
  },
  deliveryTimeframe: {
    inclusion: [
      WP.WORLDPAY_DELIVERY_TIMEFRAME_ELECTRONIC_DELIVERY,
      WP.WORLDPAY_DELIVERY_TIMEFRAME_SAME_DAY_SHIPPING,
      WP.WORLDPAY_DELIVERY_TIMEFRAME_OVERNIGHT_SHIPPING,
      WP.WORLDPAY_DELIVERY_TIMEFRAME_OTHER_SHIPPING,
    ],
  },
  deliveryEmailAddress: {
    email: true,
  },
  reorderingPreviousPurchases: {
    type: 'boolean',
  },
  preOrderPurchase: {
    type: 'boolean',
  },
  giftCardCount: {
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
    },
  },
}

module.exports = WorldpayTransactionRiskData
