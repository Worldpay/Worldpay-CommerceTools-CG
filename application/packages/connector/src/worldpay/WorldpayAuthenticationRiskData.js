'use strict'

const WorldpayBase = require('./WorldpayBase')
const WP = require('./constants')

/**
 * Worldpay Additional Risk Data for 3DS2 as defined here:
 * https://developer.worldpay.com/docs/wpg/authentication/3ds2withhpp#adding-risk-data
 */
class WorldpayAuthenticationRiskData extends WorldpayBase {
  constructor() {
    super(constraints)
  }

  /**
   * Date and time that you're submitting the authorisation.
   * @param {Date} authenticationTimestamp
   */
  withAuthenticationTimestamp(authenticationTimestamp) {
    this.authenticationTimestamp = authenticationTimestamp
    return this
  }

  /**
   * Length of time that the shopper has had the account with the merchant.
   * @param {string} authenticationMethod
   */
  withAuthenticationMethod(authenticationMethod) {
    this.authenticationMethod = authenticationMethod
    return this
  }

  buildXmlData() {
    if (!this.authenticationMethod && !this.authenticationTimestamp) {
      return
    }
    const data = {
      authenticationRiskData: {
        '@authenticationMethod': this.authenticationMethod,
        authenticationTimestamp: this.asWorldpayTimestamp(this.authenticationTimestamp),
      },
    }
    return data
  }
}

// Validation constraints
const constraints = {
  authenticationTimestamp: {
    type: 'date',
  },
  authenticationMethod: {
    inclusion: [
      WP.WORLDPAY_AUTHENTICATION_METHOD_GUEST_CHECKOUT,
      WP.WORLDPAY_AUTHENTICATION_METHOD_LOCAL_ACCOUNT,
      WP.WORLDPAY_AUTHENTICATION_METHOD_FEDERATED_ACCOUNT,
      WP.WORLDPAY_AUTHENTICATION_METHOD_ISSUER_CREDENTIALS,
      WP.WORLDPAY_AUTHENTICATION_METHOD_THIRD_PARTY,
      WP.WORLDPAY_AUTHENTICATION_METHOD_FIDO_AUTHENTICATOR,
    ],
  },
}

module.exports = WorldpayAuthenticationRiskData
