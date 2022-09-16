'use strict'

const WorldpayPaymentDetails = require('./WorldpayPaymentDetails')

/**
 * Builder to create the Klarna Pay Sliced (installments) payment
 */
class WorldpayKlarnaPaySlicedPaymentDetails extends WorldpayPaymentDetails {
  constructor(successURL, failureURL, cancelURL, pendingURL, country, locale) {
    super(constraints)

    this.withSuccessURL(successURL)
    this.withFailureURL(failureURL)
    this.withCancelURL(cancelURL)
    this.withPendingURL(pendingURL)
    this.withCountry(country)
    this.withLocale(locale)
  }

  withSuccessURL(successURL) {
    this.successURL = successURL
    return this
  }

  withFailureURL(failureURL) {
    this.failureURL = failureURL
    return this
  }

  withCancelURL(cancelURL) {
    this.cancelURL = cancelURL
    return this
  }

  withPendingURL(pendingURL) {
    this.pendingURL = pendingURL
    return this
  }

  withCountry(country) {
    this.country = country
    return this
  }

  withLocale(locale) {
    this.locale = locale
    return this
  }

  buildXmlData() {
    return {
      'KLARNA_SLICEIT-SSL': {
        successURL: this.successURL,
        cancelURL: this.cancelURL,
        pendingURL: this.pendingURL,
        failureURL: this.failureURL,
        '@shopperCountryCode': this.country,
        '@locale': this.locale,
      },
    }
  }
}

// Validation constraints
const constraints = {
  successURL: {
    type: 'string',
    presence: true,
  },
  failureURL: {
    type: 'string',
    presence: true,
  },
  cancelURL: {
    type: 'string',
    presence: true,
  },
  pendingURL: {
    type: 'string',
    presence: true,
  },
  country: {
    type: 'string',
    presence: true,
  },
  locale: {
    type: 'string',
    presence: true,
  },
}

module.exports = WorldpayKlarnaPaySlicedPaymentDetails
