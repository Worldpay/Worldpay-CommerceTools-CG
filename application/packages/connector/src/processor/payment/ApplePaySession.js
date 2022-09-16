'use strict'

const fs = require('fs')
const https = require('https')
const axios = require('axios')
const log = require('@gradientedge/wcc-logger')
const { ResponseCodes } = require('http-headers-js')
const PaymentProcessorException = require('../../../src/processor/payment/PaymentProcessorException')
const { codes: errorCodes } = require('./errors')
const path = require('path')

/**
 * IMPORTANT
 * Change these paths to your own SSL and Apple Pay certificates,
 * with the appropriate merchant identifier and domain
 * See the README.md in /certs for more information.
 */
const SSL_CERTIFICATE_PATH = './certs/merchant_id.pem'
const SSL_KEY_PATH = './certs/merchant.key.decrypted'

const ACCESS_RESTRICTIONS = {
  'apple-pay-gateway.apple.com': ['*'],
  'cn-apple-pay-gateway.apple.com': ['*'],
  'apple-pay-gateway-nc-pod1.apple.com': ['17.171.78.7', '17.141.128.9'],
  'apple-pay-gateway-nc-pod2.apple.com': ['17.171.78.71', '17.141.128.73'],
  'apple-pay-gateway-nc-pod3.apple.com': ['17.171.78.135', '17.141.128.137'],
  'apple-pay-gateway-nc-pod4.apple.com': ['17.171.78.199', '17.141.128.201'],
  'apple-pay-gateway-nc-pod5.apple.com': ['17.171.79.12', '17.141.129.13'],
  'apple-pay-gateway-pr-pod1.apple.com': ['17.141.128.7', '17.171.78.9'],
  'apple-pay-gateway-pr-pod2.apple.com': ['17.141.128.71', '17.171.78.73'],
  'apple-pay-gateway-pr-pod3.apple.com': ['17.141.128.135', '17.171.78.137'],
  'apple-pay-gateway-pr-pod4.apple.com': ['17.141.128.199', '17.171.78.201'],
  'apple-pay-gateway-pr-pod5.apple.com': ['17.141.129.12', '17.171.79.13'],
  'cn-apple-pay-gateway-sh-pod1.apple.com': ['101.230.204.232', '60.29.205.105'],
  'cn-apple-pay-gateway-sh-pod2.apple.com': ['101.230.204.242', '60.29.205.107'],
  'cn-apple-pay-gateway-sh-pod3.apple.com': ['101.230.204.240', '60.29.205.109'],
  'cn-apple-pay-gateway-tj-pod1.apple.com': ['60.29.205.104', '101.230.204.233'],
  'cn-apple-pay-gateway-tj-pod2.apple.com': ['60.29.205.106', '101.230.204.243'],
  'cn-apple-pay-gateway-tj-pod3.apple.com': ['60.29.205.108', '101.230.204.241'],
}

const SANDBOX_ACCESS_RESTRICTIONS = {
  // For sandbox testing only:
  'apple-pay-gateway-cert.apple.com': ['17.171.85.7'],
  'cn-apple-pay-gateway-cert.apple.com': ['101.230.204.235'],
}

/**
 * IMPORTANT
 * Change these paths to your own SSL and Apple Pay certificates,
 * with the appropriate merchant identifier and domain
 * See the README.md in /certs for more information.
 * @param {string} validationURL The URL to obtain the session from
 * @return {Promise<any>} The data from Apple
 * @throws {PaymentProcessorException} An exception in creating the Apple Pay session
 */
async function createApplePaySession(validationURL) {
  if (!validationURL) {
    log.error('No URL defined for Apple Session initiation')
    throw new PaymentProcessorException([{ code: errorCodes.APPLE_PAY_SESSION_MISSING_URL }])
  }

  if (!Object.keys(ACCESS_RESTRICTIONS).some((domain) => validationURL.search(domain) > 0)) {
    // None of the domains in the validation URL? Must be a hack attempt, or we're in dev mode
    if (!Object.keys(SANDBOX_ACCESS_RESTRICTIONS).some((domain) => validationURL.search(domain) > 0)) {
      throw new PaymentProcessorException([{ code: errorCodes.APPLE_PAY_SESSION_FAILED }])
    }
  }

  try {
    fs.accessSync(SSL_CERTIFICATE_PATH)
    fs.accessSync(SSL_KEY_PATH)
  } catch (error) {
    const certPath = path.resolve(SSL_CERTIFICATE_PATH)
    const keyPath = path.resolve(SSL_KEY_PATH)
    log.error(`Error loading certificate from ${certPath} or private key from ${keyPath}`, { error })
    throw new PaymentProcessorException([{ code: errorCodes.APPLE_PAY_SESSION_MISSING_CERTS }])
  }

  try {
    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(SSL_CERTIFICATE_PATH),
      key: fs.readFileSync(SSL_KEY_PATH),
    })

    const response = await axios.post(
      validationURL,
      {
        merchantIdentifier: process.env.WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_ID,
        domainName: process.env.WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_DOMAIN,
        displayName: process.env.WORLDPAY_CONNECTOR_MERCHANT_NAME,
      },
      { httpsAgent },
    )

    // Send the request to the Apple Pay server and return the response to the client
    if (response.status === ResponseCodes.OK) {
      return response
    }
  } catch (error) {
    log.error('Error generating Apple Pay session!', { error })
  }
  throw new PaymentProcessorException([{ code: errorCodes.APPLE_PAY_SESSION_FAILED }])
}

module.exports = createApplePaySession
