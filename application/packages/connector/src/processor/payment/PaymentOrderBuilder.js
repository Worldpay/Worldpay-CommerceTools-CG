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
const WorldpayCreateTokenData = require('../../worldpay/WorldpayCreateTokenData')
const { WORLDPAY_TOKEN_SCOPE_SHOPPER, WORLDPAY_TOKEN_OPT_IN_ASK } = require('../../worldpay/constants')
const {
  PAYMENT_METHOD_CARD,
  PAYMENT_METHOD_TOKENISED_CARD,
  PAYMENT_METHOD_GOOGLE_PAY,
  PAYMENT_METHOD_APPLE_PAY,
  PAYMENT_METHOD_PAYPAL,
  PAYMENT_METHOD_KLARNA_PAYNOW,
  PAYMENT_METHOD_KLARNA_PAYLATER,
  PAYMENT_METHOD_KLARNA_PAYSLICED,
  PAYMENT_METHOD_IDEAL,
} = require('./constants')
const WorldpayTokenisedCardPaymentDetails = require('../../worldpay/WorldpayTokenisedCardPaymentDetails')
const WorldpayGooglePayPaymentDetails = require('../../worldpay/WorldpayGooglePayPaymentDetails')
const WorldpayApplePayPaymentDetails = require('../../worldpay/WorldpayApplePayPaymentDetails')
const WorldpayPayPalPaymentDetails = require('../../worldpay/WorldpayPayPalPaymentDetails')
const PaymentProcessorException = require('./PaymentProcessorException')
const { codes: errorCodes } = require('./errors')
const WorldpayKlarnaPayNowPaymentDetails = require('../../worldpay/WorldpayKlarnaPayNowPaymentDetails')
const WorldpayKlarnaPayLaterPaymentDetails = require('../../worldpay/WorldpayKlarnaPayLaterPaymentDetails')
const WorldpayKlarnaPaySlicedPaymentDetails = require('../../worldpay/WorldpayKlarnaPaySlicedPaymentDetails')
const WorldpayIdealPaymentDetails = require('../../worldpay/WorldpayIdealPaymentDetails')
const { mapPayPalLanguageCodes, mapKlarnaLocaleCodes } = require('../../utils/worldPayMapper')
const getOrderLines = require('./OrderLineBuilder')
const WorldpayExemptionRequest = require('../../worldpay/WorldpayExemptionRequest')
const { compliesWithISO_3611_2, lookupISO_3611_2_State } = require('../../utils/ISO_3611_2')

const PAYMENT_METHODS_WITH_ADDRESS = [
  PAYMENT_METHOD_CARD,
  PAYMENT_METHOD_KLARNA_PAYNOW,
  PAYMENT_METHOD_KLARNA_PAYLATER,
  PAYMENT_METHOD_KLARNA_PAYSLICED,
]
const PAYMENT_METHODS_WITH_ORDER_LINES = PAYMENT_METHODS_WITH_ADDRESS

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
    this.hostedPaymentPage = payload?.resource?.obj?.paymentMethodInfo?.method === PAYMENT_METHOD_CARD

    const paymentRequest = this.createPaymentRequest(cart, payload, headers)

    if (this.hostedPaymentPage) {
      this.applyAuthenticationRiskData(paymentRequest, cart, customer)
      this.applyShopperAccountRiskData(paymentRequest, cart, customer)
    }
    if (this.hostedPaymentPage && this.options.enableTokenisation && customer) {
      this.applyCreateTokenData(paymentRequest, cart)
    }

    if (this.hostedPaymentPage) {
      this.applyTransactionRiskData(paymentRequest, cart)
    }

    if (this.options.exemptionEnabled) {
      this.applyExemptionData(paymentRequest)
    }

    if (this.hostedPaymentPage && this.options.includeFraudSight) {
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
    const customerId = this.getAuthenticatedShopperID(payload)
    const paymentMethod = payload.resource.obj?.paymentMethodInfo?.method
    const allowSpaces = this.options.spacesInPaypalDescription || paymentMethod !== PAYMENT_METHOD_PAYPAL
    const paymentRequest = new WorldpayPaymentRequest(this.options.merchantCode, this.options.installationId)
      .withOrderDetails(this.getOrderCode(payload), this.getOrderDescription(payload, allowSpaces))
      .withOrderContent(this.getOrderContent(payload))
      .withCaptureDelay(this.options.captureDelay || WP.WORLDPAY_ORDER_CAPTURE_DELAY_DEFAULT)
      .withPaymentMethodMask(this.hostedPaymentPage ? new WorldpayPaymentMethodMask().includeAll() : undefined)
      .withPaymentDetails(this.hostedPaymentPage ? undefined : this.getPaymentDetails(payload, customerId, cart))
      .withPaymentAmount(new WorldpayAmount(cart.totalPrice.currencyCode, cart.totalPrice.centAmount))
      .withShopperDetails(
        new WorldpayShopper(cart.billingAddress?.email, customerId)
          .withBrowserAcceptHeader(headers.accept ?? '*/*')
          .withBrowserUserAgentHeader(headers.userAgent ?? 'Mozilla/5.0 () Worldpay commercetools connector'),
      )

    if (paymentMethod === PAYMENT_METHOD_PAYPAL) {
      const language = mapPayPalLanguageCodes(cart.country)
      paymentRequest.withShopperLanguageCode(language)
    }

    if (PAYMENT_METHODS_WITH_ORDER_LINES.includes(paymentMethod)) {
      paymentRequest.withOrderLines(getOrderLines(cart, this.options))
    }

    if (PAYMENT_METHODS_WITH_ADDRESS.includes(paymentMethod)) {
      const billingAddress = this.address(cart.billingAddress)
      if (billingAddress) {
        paymentRequest.withBillingAddress(billingAddress)
      }
      const shippingAddress = this.address(cart.shippingAddress)
      if (shippingAddress) {
        paymentRequest.withShippingAddress(shippingAddress)
      }
    }

    return paymentRequest
  }

  address(address) {
    if (address?.streetName && address?.postalCode && address?.city && address?.country) {
      const newAddress = new WorldpayAddress()
        .withFirstName(address.firstName)
        .withLastName(address.lastName)
        .withAddress1(address.streetName)
        .withAddress2(address.additionalStreetInfo)
        .withCity(address.city)
        .withPostalCode(address.postalCode)
        .withCountryCode(address.country)
        .withTelephoneNumber(address.mobile ?? address.phone)
      if (this.options.mapStateToISOCode && address.state && ['US', 'CN'].includes(address.country)) {
        const state = address.state
        const stateCode = compliesWithISO_3611_2(state) ? state : lookupISO_3611_2_State(state)
        // The state code has form `US-AB`, but worldpay only wants `AB`
        newAddress.withState(stateCode?.substring(3))
      } else {
        newAddress.withState(address.state)
      }
      return newAddress
    }
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
          customer ? WP.WORLDPAY_AUTHENTICATION_METHOD_LOCAL_ACCOUNT : WP.WORLDPAY_AUTHENTICATION_METHOD_GUEST_CHECKOUT,
        ),
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
        .withShippingNameMatchesAccountName(this.isShippingNameSameAsAccountName(cart, customer)),
    )
  }

  /**
   * Determine if the customer's name on the shipping address is the same as their profile name
   *
   * @param {object} cart The customer's active cart
   * @param {object|null} customer The Commercetools customer profile object
   */
  isShippingNameSameAsAccountName(cart, customer) {
    if (!customer || !cart) {
      return false
    }
    const shippingFirstName = cart.shippingAddress.firstName ? cart.shippingAddress.firstName.trim() : ''
    const shippingLastName = cart.shippingAddress.lastName ? cart.shippingAddress.lastName.trim() : ''
    const customerFirstName = customer.firstName ? customer.firstName.trim() : ''
    const customerLastName = customer.lastName ? customer.lastName.trim() : ''

    if (shippingFirstName === '' && shippingLastName === '') {
      return false
    }
    if (customerFirstName === '' && customerLastName === '') {
      return false
    }

    return shippingFirstName === customerFirstName && shippingLastName === customerLastName
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
          : WP.WORLDPAY_SHIPPING_METHOD_SHIP_TO_OTHER_ADDRESS,
      ),
    )
  }

  /**
   * Apply the Exemption data to the payment request
   * @param {WorldpayPaymentRequest} paymentRequest The payment request to apply the exemption data to
   */
  applyExemptionData(paymentRequest) {
    const exemption = new WorldpayExemptionRequest()
      .withType(this.options.exemptionType)
      .withPlacement(this.options.exemptionPlacement)
    paymentRequest.withExemptionRequest(exemption)
    return paymentRequest
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
      .withShopperAddress(this.address(cart.billingAddress))
      .withShopperName(`${cart.billingAddress.firstName} ${cart.billingAddress.lastName}`.trim())

    if (customer) {
      fraudSightData.withShopperId(customer.id)
    }
    paymentRequest.withFraudSightData(fraudSightData)
    return paymentRequest
  }

  /**
   * Apply the CreateToken data to the payment request
   * @param  {WorldpayPaymentRequest} paymentRequest The payment request to apply the create token data to
   * @param {object} cart The customer's active cart
   * @returns {WorldpayPaymentRequest}
   */
  applyCreateTokenData(paymentRequest, cart) {
    return paymentRequest.withCreateTokenData(
      new WorldpayCreateTokenData()
        .withTokenScope(WORLDPAY_TOKEN_SCOPE_SHOPPER)
        .withTokenOptIn(WORLDPAY_TOKEN_OPT_IN_ASK)
        .withTokenEventReference(this.getTokenEventReference(cart)),
    )
  }

  /**
   * Get the token Event reference
   *
   * @param {object} cart The cart object with information such as the orderCode
   * @returns {string}
   */
  getTokenEventReference(cart) {
    return `Order_${cart.id}`?.replace(/\W/g, '_')
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
   * @param {boolean} allowSpaces Convert the spaces in the description into -
   * @returns {string}
   */
  getOrderDescription(payload, allowSpaces = true) {
    const description = `commercetools plugin - ${this.project.key} - order ${payload.resource.id}`
    return allowSpaces ? description : description.replace(/ /g, '_')
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
    return this.getOrderDescription(payload, true)
  }

  /**
   * Get the payment details associated with the payment method and paymentData
   *
   * @param {object} payload The payload delivered to the extension
   * @param {string} customerId The customer's identifier
   * @param {object} cart The customer's shopping cart
   * @returns {WorldpayPaymentDetails} Optional worldpay payment details - undefined if not available
   */
  getPaymentDetails(payload, customerId, cart) {
    const paymentMethod = payload.resource.obj?.paymentMethodInfo?.method
    const jsonPaymentData = payload.resource.obj?.custom?.fields?.paymentData
    const paymentData = jsonPaymentData ? JSON.parse(jsonPaymentData) : undefined

    const country = cart.country
    const locale = mapKlarnaLocaleCodes(country)
    const path = this.options.returnURL + '?'
    const successURL = `${path}status=success`
    const failureURL = `${path}status=failure`
    const cancelURL = `${path}status=cancel`
    const pendingURL = `${path}status=pending`

    switch (paymentMethod) {
      case PAYMENT_METHOD_CARD:
        return undefined
      case PAYMENT_METHOD_TOKENISED_CARD: {
        const paymentTokenID = paymentData?.paymentTokenId
        if (!paymentTokenID) {
          throw new PaymentProcessorException([{ code: errorCodes.MISSING_TOKENISED_CARD_TOKEN }])
        }
        return new WorldpayTokenisedCardPaymentDetails(paymentTokenID, customerId, paymentData?.ip)
      }
      case PAYMENT_METHOD_GOOGLE_PAY: {
        let token = paymentData?.paymentMethodData?.tokenizationData?.token
        if (!token) {
          throw new PaymentProcessorException([{ code: errorCodes.MISSING_PAYMENT_DATA_GOOGLE_PAY }])
        }
        token = JSON.parse(token)
        const protocolVersion = token?.protocolVersion
        const signature = token?.signature
        const signedMessage = token?.signedMessage
        if (!protocolVersion || !signature || !signedMessage) {
          throw new PaymentProcessorException([{ code: errorCodes.MISSING_PAYMENT_DATA_GOOGLE_PAY }])
        }
        return new WorldpayGooglePayPaymentDetails(
          protocolVersion,
          signature,
          signedMessage,
          customerId,
          paymentData?.ip,
        )
      }
      case PAYMENT_METHOD_APPLE_PAY: {
        const applePaymentData = paymentData?.token?.paymentData
        if (!applePaymentData) {
          throw new PaymentProcessorException([{ code: errorCodes.MISSING_PAYMENT_DATA_APPLE_PAY }])
        }
        return new WorldpayApplePayPaymentDetails(customerId, paymentData?.ip)
          .withData(applePaymentData.data)
          .withSignature(applePaymentData.signature)
          .withPublicKeyHash(applePaymentData.header?.publicKeyHash)
          .withEphemeralPublicKey(applePaymentData.header?.ephemeralPublicKey)
          .withTransactionId(applePaymentData.header?.transactionId)
          .withVersion(applePaymentData.version)
      }
      case PAYMENT_METHOD_PAYPAL: {
        return new WorldpayPayPalPaymentDetails(successURL, failureURL, cancelURL)
      }
      case PAYMENT_METHOD_KLARNA_PAYNOW: {
        return new WorldpayKlarnaPayNowPaymentDetails(successURL, failureURL, cancelURL, pendingURL, country, locale)
      }
      case PAYMENT_METHOD_KLARNA_PAYLATER: {
        return new WorldpayKlarnaPayLaterPaymentDetails(successURL, failureURL, cancelURL, pendingURL, country, locale)
      }
      case PAYMENT_METHOD_KLARNA_PAYSLICED: {
        return new WorldpayKlarnaPaySlicedPaymentDetails(successURL, failureURL, cancelURL, pendingURL, country, locale)
      }
      case PAYMENT_METHOD_IDEAL: {
        return new WorldpayIdealPaymentDetails(successURL, failureURL, cancelURL, pendingURL).withShopperBankCode(
          paymentData?.shopperBankCode,
        )
      }
      default: {
        throw new PaymentProcessorException([{ code: errorCodes.UNEXPECTED_PAYMENT_METHOD }])
      }
    }
  }

  /**
   * Extract the customer's id to be used as authenticated shopper ID
   * @param {object} payload The payload delivered to the extension
   * @returns {string} The authenticated shopper id
   */
  getAuthenticatedShopperID(payload) {
    return payload?.resource?.obj?.customer?.id
  }
}

module.exports = PaymentOrderBuilder
