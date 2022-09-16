'use strict'

const WorldpayBase = require('./WorldpayBase')
const WP = require('./constants')

/**
 * Worldpay Additional Risk Data for 3DS2 as defined here:
 * https://developer.worldpay.com/docs/wpg/authentication/3ds2withhpp#adding-risk-data
 */
class WorldpayShopperAccountRiskData extends WorldpayBase {
  constructor() {
    super(constraints)
  }

  /**
   * Date that the shopper opened the account with the merchant.
   * @param {Date} shopperAccountCreationDate
   */
  withShopperAccountCreationDate(shopperAccountCreationDate) {
    this.shopperAccountCreationDate = shopperAccountCreationDate
    return this
  }

  /**
   * Date that the shopper's account with the merchant was last changed,
   * including Billing or Shipping address, new payment account, or new user(s) added.
   * @param {Date} shopperAccountModificationDate
   */
  withShopperAccountModificationDate(shopperAccountModificationDate) {
    this.shopperAccountModificationDate = shopperAccountModificationDate
    return this
  }

  /**
   * Date that shopper's account with the merchant had a password change or account reset.
   * @param {Date} shopperAccountPasswordChangeDate
   */
  withShopperAccountPasswordChangeDate(shopperAccountPasswordChangeDate) {
    this.shopperAccountPasswordChangeDate = shopperAccountPasswordChangeDate
    return this
  }

  /**
   * Indicates when the shipping address used for the transaction was first used.
   * @param {Date} shopperAccountShippingAddressFirstUseDate
   */
  withShopperAccountShippingAddressFirstUseDate(shopperAccountShippingAddressFirstUseDate) {
    this.shopperAccountShippingAddressFirstUseDate = shopperAccountShippingAddressFirstUseDate
    return this
  }

  /**
   * Date the payment account was added to the shopper account.
   * @param {Date} shopperAccountPaymentAccountFirstUseDate
   */
  withShopperAccountPaymentAccountFirstUseDate(shopperAccountPaymentAccountFirstUseDate) {
    this.shopperAccountPaymentAccountFirstUseDate = shopperAccountPaymentAccountFirstUseDate
    return this
  }

  /**
   * Number of transactions (successful and abandoned) for this shopper account with the
   * merchant across all payment accounts in the previous 24 hours
   * @param {number} transactionsAttemptedLastDay
   */
  withTransactionsAttemptedLastDay(transactionsAttemptedLastDay) {
    this.transactionsAttemptedLastDay = transactionsAttemptedLastDay
    return this
  }

  /**
   * Number of transactions (successful and abandoned) for this shopper account with the
   * merchant across all payment accounts in the previous year.
   * @param {number} transactionsAttemptedLastYear
   */
  withTransactionsAttemptedLastYear(transactionsAttemptedLastYear) {
    this.transactionsAttemptedLastYear = transactionsAttemptedLastYear
    return this
  }

  /**
   * Number of purchases with this shopper account during the previous six months.
   * @param {number} purchasesCompletedLastSixMonths
   */
  withPurchasesCompletedLastSixMonths(purchasesCompletedLastSixMonths) {
    this.purchasesCompletedLastSixMonths = purchasesCompletedLastSixMonths
    return this
  }

  /**
   * Number of Add Card attempts in the last 24 hours.
   * @param {number} addCardAttemptsLastDay
   */
  withAddCardAttemptsLastDay(addCardAttemptsLastDay) {
    this.addCardAttemptsLastDay = addCardAttemptsLastDay
    return this
  }

  /**
   * Indicates whether the merchant has experienced suspicious activity
   * (including previous fraud) on the shopper account.
   * @param {boolean} previousSuspiciousActivity
   */
  withPreviousSuspiciousActivity(previousSuspiciousActivity) {
    this.previousSuspiciousActivity = previousSuspiciousActivity
    return this
  }

  /**
   * Indicates if the cardholder name on the account is identical to the shipping name used for this transaction.
   * @param {boolean} shippingNameMatchesAccountName
   */
  withShippingNameMatchesAccountName(shippingNameMatchesAccountName) {
    this.shippingNameMatchesAccountName = shippingNameMatchesAccountName
    return this
  }

  /**
   * Indicates how long the shopper had the account with the merchant.
   * @param {string} shopperAccountAgeIndicator
   */
  withShopperAccountAgeIndicator(shopperAccountAgeIndicator) {
    this.shopperAccountAgeIndicator = shopperAccountAgeIndicator
    return this
  }

  /**
   * Length of time since the last change to the shopper's account. This includes billing or shipping address,
   * new payment methods or new users added.
   * @param {string} shopperAccountChangeIndicator
   */
  withShopperAccountChangeIndicator(shopperAccountChangeIndicator) {
    this.shopperAccountChangeIndicator = shopperAccountChangeIndicator
    return this
  }

  /**
   * Indicates when the shopper's account password was last changed or reset.
   * @param {string} shopperAccountPasswordChangeIndicator
   */
  withShopperAccountPasswordChangeIndicator(shopperAccountPasswordChangeIndicator) {
    this.shopperAccountPasswordChangeIndicator = shopperAccountPasswordChangeIndicator
    return this
  }

  /**
   * Indicates when the shipping address was first used.
   * @param {string} shopperAccountShippingAddressUsageIndicator
   */
  withShopperAccountShippingAddressUsageIndicator(shopperAccountShippingAddressUsageIndicator) {
    this.shopperAccountShippingAddressUsageIndicator = shopperAccountShippingAddressUsageIndicator
    return this
  }

  /**
   * Indicates when the payment account was first used.
   * @param {string} shopperAccountPaymentAccountIndicator
   */
  withShopperAccountPaymentAccountIndicator(shopperAccountPaymentAccountIndicator) {
    this.shopperAccountPaymentAccountIndicator = shopperAccountPaymentAccountIndicator
    return this
  }

  buildXmlData() {
    if (
      !this.shopperAccountCreationDate &&
      !this.shopperAccountModificationDate &&
      !this.shopperAccountPasswordChangeDate &&
      !this.shopperAccountShippingAddressFirstUseDate &&
      !this.shopperAccountPaymentAccountFirstUseDate &&
      !this.transactionsAttemptedLastDay &&
      !this.transactionsAttemptedLastYear &&
      !this.purchasesCompletedLastSixMonths &&
      !this.addCardAttemptsLastDay &&
      !this.previousSuspiciousActivity &&
      !this.shippingNameMatchesAccountName &&
      !this.shopperAccountAgeIndicator &&
      !this.shopperAccountChangeIndicator &&
      !this.shopperAccountPasswordChangeIndicator &&
      !this.shopperAccountShippingAddressUsageIndicator &&
      !this.shopperAccountPaymentAccountIndicator
    ) {
      return
    }

    const data = {
      shopperAccountRiskData: {
        shopperAccountCreationDate: this.asWorldpayDate(this.shopperAccountCreationDate),
        shopperAccountModificationDate: this.asWorldpayDate(this.shopperAccountModificationDate),
        shopperAccountPasswordChangeDate: this.asWorldpayDate(this.shopperAccountPasswordChangeDate),
        shopperAccountShippingAddressFirstUseDate: this.asWorldpayDate(this.shopperAccountShippingAddressFirstUseDate),
        shopperAccountPaymentAccountFirstUseDate: this.asWorldpayDate(this.shopperAccountPaymentAccountFirstUseDate),
        '@transactionsAttemptedLastDay': this.transactionsAttemptedLastDay,
        '@transactionsAttemptedLastYear': this.transactionsAttemptedLastYear,
        '@purchasesCompletedLastSixMonths': this.purchasesCompletedLastSixMonths,
        '@addCardAttemptsLastDay': this.addCardAttemptsLastDay,
        '@previousSuspiciousActivity': this.previousSuspiciousActivity,
        '@shippingNameMatchesAccountName': this.shippingNameMatchesAccountName,
        '@shopperAccountAgeIndicator': this.shopperAccountAgeIndicator,
        '@shopperAccountChangeIndicator': this.shopperAccountChangeIndicator,
        '@shopperAccountPasswordChangeIndicator': this.shopperAccountPasswordChangeIndicator,
        '@shopperAccountShippingAddressUsageIndicator': this.shopperAccountShippingAddressUsageIndicator,
        '@shopperAccountPaymentAccountIndicator': this.shopperAccountPaymentAccountIndicator,
      },
    }
    return data
  }
}

// Validation constraints
const constraints = {
  shopperAccountCreationDate: {
    type: 'date',
  },
  shopperAccountModificationDate: {
    type: 'date',
  },
  shopperAccountPasswordChangeDate: {
    type: 'date',
  },
  shopperAccountShippingAddressFirstUseDate: {
    type: 'date',
  },
  shopperAccountPaymentAccountFirstUseDate: {
    type: 'date',
  },
  transactionsAttemptedLastDay: {
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
    },
  },
  transactionsAttemptedLastYear: {
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
    },
  },
  purchasesCompletedLastSixMonths: {
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
    },
  },
  addCardAttemptsLastDay: {
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
    },
  },
  previousSuspiciousActivity: { type: 'boolean' },
  shippingNameMatchesAccountName: { type: 'boolean' },
  shopperAccountAgeIndicator: {
    inclusion: [
      WP.WORLDPAY_ACCOUNT_INDICATOR_NO_ACCOUNT,
      WP.WORLDPAY_ACCOUNT_INDICATOR_CREATED_DURING_TRANSACTION,
      WP.WORLDPAY_ACCOUNT_INDICATOR_LESS_THAN_THIRTY_DAYS,
      WP.WORLDPAY_ACCOUNT_INDICATOR_LESS_THIRTY_TO_SIXTY_DAYS,
      WP.WORLDPAY_ACCOUNT_INDICATOR_MORE_THAN_SIXTY_DAYS,
    ],
  },
  shopperAccountChangeIndicator: {
    inclusion: [
      WP.WORLDPAY_ACCOUNT_INDICATOR_CHANGED_DURING_TRANSACTION,
      WP.WORLDPAY_ACCOUNT_INDICATOR_LESS_THAN_THIRTY_DAYS,
      WP.WORLDPAY_ACCOUNT_INDICATOR_LESS_THIRTY_TO_SIXTY_DAYS,
      WP.WORLDPAY_ACCOUNT_INDICATOR_MORE_THAN_SIXTY_DAYS,
    ],
  },
  shopperAccountPasswordChangeIndicator: {
    inclusion: [
      WP.WORLDPAY_ACCOUNT_INDICATOR_NO_CHANGE,
      WP.WORLDPAY_ACCOUNT_INDICATOR_CHANGED_DURING_TRANSACTION,
      WP.WORLDPAY_ACCOUNT_INDICATOR_LESS_THAN_THIRTY_DAYS,
      WP.WORLDPAY_ACCOUNT_INDICATOR_LESS_THIRTY_TO_SIXTY_DAYS,
      WP.WORLDPAY_ACCOUNT_INDICATOR_MORE_THAN_SIXTY_DAYS,
    ],
  },
  shopperAccountShippingAddressUsageIndicator: {
    inclusion: [
      WP.WORLDPAY_ACCOUNT_INDICATOR_THIS_TRANSACTION,
      WP.WORLDPAY_ACCOUNT_INDICATOR_LESS_THAN_THIRTY_DAYS,
      WP.WORLDPAY_ACCOUNT_INDICATOR_LESS_THIRTY_TO_SIXTY_DAYS,
      WP.WORLDPAY_ACCOUNT_INDICATOR_MORE_THAN_SIXTY_DAYS,
    ],
  },
  shopperAccountPaymentAccountIndicator: {
    inclusion: [
      WP.WORLDPAY_ACCOUNT_INDICATOR_NO_ACCOUNT,
      WP.WORLDPAY_ACCOUNT_INDICATOR_DURING_TRANSACTION,
      WP.WORLDPAY_ACCOUNT_INDICATOR_LESS_THAN_THIRTY_DAYS,
      WP.WORLDPAY_ACCOUNT_INDICATOR_LESS_THIRTY_TO_SIXTY_DAYS,
      WP.WORLDPAY_ACCOUNT_INDICATOR_MORE_THAN_SIXTY_DAYS,
    ],
  },
}

module.exports = WorldpayShopperAccountRiskData
