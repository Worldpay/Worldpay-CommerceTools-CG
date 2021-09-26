'use strict'

const _ = require('lodash')

const WorldpayPaymentRequest = require('../../worldpay/WorldpayPaymentRequest')
const WorldpayShopper = require('../../worldpay/WorldpayShopper')
const WorldpayAddress = require('../../worldpay/WorldpayAddress')
const WorldpayAmount = require('../../worldpay/WorldpayAmount')
const WorldpayPaymentMethodMask = require('../../worldpay/WorldpayPaymentMethodMask')
const WorldpayAuthenticationRiskData = require('../../worldpay/WorldpayAuthenticationRiskData')
const WorldpayShopperAccountRiskData = require('../../worldpay/WorldpayShopperAccountRiskData')
const WorldpayTransactionRiskData = require('../../worldpay/WorldpayTransactionRiskData')
const WorldpayFraudSightData = require('../../worldpay/WorldpayFraudSightData')
const WP = require('../../worldpay/constants')

class PaymentOrderBuilder {
  constructor(options, project) {
    this.options = options
    this.project = project
  }

  /**
   * Build the order object
   *
   * @param {object} cart The customer's active cart
   * @param {object|null} customer The Commercetools customer profile object
   * @param {object} payload The payload delivered to the extension
   * @param {object} headers HTTP headers
   * @returns {WorldpayPaymentRequest}
   */
  build(cart, customer, payload, headers) {
    const paymentRequest = this.createPaymentRequest(cart, payload, headers)

    this.applyAuthenticationRiskData(paymentRequest, cart, customer)
    this.applyShopperAccountRiskData(paymentRequest, cart, customer)
    this.applyTransactionRiskData(paymentRequest, cart)

    if (this.options.includeFraudSight) {
      this.applyFraudSightData(paymentRequest, cart, customer)
    }

    return paymentRequest
  }

  /**
   * Create the payment request
   *
   * @param {object} cart The customer's active cart
   * @param {object} payload The payload delivered to the extension
   * @param {object} headers HTTP headers
   * @returns {WorldpayPaymentRequest}
   */
  createPaymentRequest(cart, payload, headers) {
    return new WorldpayPaymentRequest(this.options.merchantCode, this.options.installationId)
      .withOrderDetails(this.getOrderCode(payload), this.getOrderDescription(payload))
      .withOrderContent(this.getOrderContent(payload))
      .withCaptureDelay(WP.WORLDPAY_ORDER_CAPTURE_DELAY_DEFAULT)
      .withPaymentMethodMask(new WorldpayPaymentMethodMask().includeAll())
      .withPaymentAmount(
        new WorldpayAmount(cart.totalPrice.currencyCode, cart.totalPrice.centAmount)
      )
      .withShopperDetails(
        new WorldpayShopper(cart.shippingAddress.email)
          .withBrowserAcceptHeader(headers.accept)
          .withBrowserUserAgentHeader(headers.userAgent)
      )
      .withShippingAddress(
        new WorldpayAddress()
          .withAddress1(cart.shippingAddress.streetName)
          .withAddress2(cart.shippingAddress.additionalStreetInfo)
          .withCity(cart.shippingAddress.city)
          .withPostalCode(cart.shippingAddress.postalCode)
          .withCountryCode(cart.shippingAddress.country)
      )
      .withBillingAddress(
        new WorldpayAddress()
          .withAddress1(cart.billingAddress.streetName)
          .withAddress2(cart.billingAddress.additionalStreetInfo)
          .withCity(cart.billingAddress.city)
          .withPostalCode(cart.billingAddress.postalCode)
          .withCountryCode(cart.billingAddress.country)
      )
  }

  /**
   * Apply the authentication risk data to the payment request
   *
   * @param {WorldpayPaymentRequest} paymentRequest The payment request to apply the risk data to
   * @param {object} cart The customer's active cart
   * @param {object|null} customer The Commercetools customer profile object
   * @returns {WorldpayPaymentRequest}
   */
  applyAuthenticationRiskData(paymentRequest, cart, customer) {
    return paymentRequest.withAuthenticationRiskData(
      new WorldpayAuthenticationRiskData()
        .withAuthenticationTimestamp(new Date())
        .withAuthenticationMethod(
          customer
            ? WP.WORLDPAY_AUTHENTICATION_METHOD_LOCAL_ACCOUNT
            : WP.WORLDPAY_AUTHENTICATION_METHOD_GUEST_CHECKOUT
        )
    )
  }

  /**
   * Apply the account risk data to the payment request
   *
   * This risk data is specific to customers that have an account, so we just
   * return the WorldpayPaymentRequest passed in if the `customer` parameter
   * is null.
   *
   * @param {WorldpayPaymentRequest} paymentRequest The payment request to apply the risk data to
   * @param {object} cart The customer's active cart
   * @param {object|null} customer The Commercetools customer profile object
   * @returns {WorldpayPaymentRequest}
   */
  applyShopperAccountRiskData(paymentRequest, cart, customer) {
    if (!customer) {
      return paymentRequest
    }

    return paymentRequest.withShopperAccountRiskData(
      new WorldpayShopperAccountRiskData()
        .withShopperAccountCreationDate(new Date(customer.createdAt))
        .withShopperAccountModificationDate(new Date(customer.lastModifiedAt))
        .withShippingNameMatchesAccountName(this.isShippingNameSameAsAccountName(cart, customer))
    )
  }

  /**
   * Determine if the customer's name on the shipping address is the same as their profile name
   *
   * @param {object} cart The customer's active cart
   * @param {object|null} customer The Commercetools customer profile object
   */
  isShippingNameSameAsAccountName(cart, customer) {
    return (
      cart.shippingAddress.firstName.trim() === customer.firstName.trim() &&
      cart.shippingAddress.lastName.trim() === customer.lastName.trim()
    )
  }

  /**
   * Apply the account risk data to the payment request
   *
   * @param {WorldpayPaymentRequest} paymentRequest The payment request to apply the risk data to
   * @param {object} cart The customer's active cart
   * @returns {WorldpayPaymentRequest}
   */
  applyTransactionRiskData(paymentRequest, cart) {
    return paymentRequest.withTransactionRiskData(
      new WorldpayTransactionRiskData().withShippingMethod(
        this.isShippingAddressSameAsBillingAddress(cart)
          ? WP.WORLDPAY_SHIPPING_METHOD_SHIP_TO_BILLING_ADDRESS
          : WP.WORLDPAY_SHIPPING_METHOD_SHIP_TO_OTHER_ADDRESS
      )
    )
  }

  /**
   * Apply the FraudSight data to the payment request
   *
   * @param {WorldpayPaymentRequest} paymentRequest The payment request to apply the risk data to
   * @param {object} cart The customer's active cart
   * @param {object|null} customer The Commercetools customer profile object
   * @returns {WorldpayPaymentRequest}
   */
  applyFraudSightData(paymentRequest, cart, customer) {
    const fraudSightData = new WorldpayFraudSightData()
      .withShopperAddress(
        new WorldpayAddress()
          .withFirstName(cart.billingAddress.firstName)
          .withLastName(cart.billingAddress.lastName)
          .withAddress1(cart.billingAddress.streetName)
          .withAddress2(cart.billingAddress.additionalStreetInfo)
          .withCity(cart.billingAddress.city)
          .withPostalCode(cart.billingAddress.postalCode)
          .withCountryCode(cart.billingAddress.country)
      )
      .withShopperName(`${cart.billingAddress.firstName} ${cart.billingAddress.lastName}`.trim())

    if (customer) {
      fraudSightData.withShopperId(customer.id)
    }
    paymentRequest.withFraudSightData(fraudSightData)
    return paymentRequest
  }

  /**
   * Check to see if the shipping and billing address are identical
   *
   * @param {object} cart The customer's active cart
   * @returns {boolean}
   */
  isShippingAddressSameAsBillingAddress(cart) {
    return _.isEqual(cart.shippingAddress, cart.billingAddress)
  }

  /**
   * Get the order code
   *
   * @param {object} payload The payload delivered to the extension
   * @returns {*}
   */
  getOrderCode(payload) {
    return payload.resource.id
  }

  /**
   * Get the order description
   *
   * This string helps Worldpay to identify the source of the request.
   *
   * @param {object} payload The payload delivered to the extension
   * @returns {string}
   */
  getOrderDescription(payload) {
    return `commercetools plugin v${this.project.version} - ${this.project.key} - order ${payload.resource.id}`
  }

  /**
   * Get the order content
   *
   * TODO: return more appropriate content. Requirements to be defined.
   *
   * @param {object} payload The payload delivered to the extension
   * @returns {string}
   */
  getOrderContent(payload) {
    return this.getOrderDescription(payload)
  }
}

module.exports = PaymentOrderBuilder
