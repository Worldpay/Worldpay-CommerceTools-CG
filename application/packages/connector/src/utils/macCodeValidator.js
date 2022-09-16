'use strict'

const crypto = require('crypto')
const _ = require('lodash')

/**
 * Verify the MAC code contained within a Worldpay redirect URL is valid
 * https://developer.worldpay.com/docs/wpg/hostedintegration/securingpayments
 *
 * @param {string} redirectUrl HPP redirect URL obtained from Worldpay
 * @param {string} macSecret MAC secret as configured in Worldpay Merchant Interface (MAI)
 */
function verifyMacCode(redirectUrl, macSecret) {
  const params = extractRedirectUrlParameters(redirectUrl)
  const stringToHash = params.join(':')
  const expectedMacCode = generateMacCode(stringToHash, macSecret)
  const providedMacCode = extractMacCodeParam(redirectUrl)
  return expectedMacCode === providedMacCode
}

function generateMacCode(stringToHash, macSecret) {
  return crypto.createHmac('sha256', macSecret).update(stringToHash).digest('hex')
}

function extractRedirectUrlParameters(redirectUrl) {
  // extract the expected params from the redirect url
  // expected params are - orderKey:paymentAmount:paymentCurrency:paymentStatus
  // If the shopper clicks 'Cancel' on the payment page, this results in an order without paymentStatus. Instead the following string is combined with the MAC secret:
  // orderKey:orderAmount:orderCurrency

  const expectedPaymentParams = ['orderKey', 'paymentAmount', 'paymentCurrency', 'paymentStatus']
  const expectedCancelParams = ['orderKey', 'orderAmount', 'orderCurrency']
  let parsedUrl
  try {
    parsedUrl = new URL(redirectUrl)
  } catch (error) {
    throw new Error(`Unable to parse redirect URL [${redirectUrl}] - ${error.toString()}`)
  }

  // Get all of the expected payment params
  const paymentParamValues = expectedPaymentParams.map((param) => parsedUrl.searchParams.get(param))
  const allPaymentParamValuesPresent = paymentParamValues.every((param) => !_.isEmpty(param))

  // Get all of the expected cancel params
  const cancelParamValues = expectedCancelParams.map((param) => parsedUrl.searchParams.get(param))
  const allCancelParamValuesPresent = cancelParamValues.every((param) => !_.isEmpty(param))

  //console.log(`P:${allPaymentParamValuesPresent} C:${allCancelParamValuesPresent} [${redirectUrl}]`)

  if (!(allPaymentParamValuesPresent || allCancelParamValuesPresent)) {
    throw new Error(
      `Neither the expected payment params or cancel params are present in the redirect URL [${redirectUrl}]`,
    )
  }

  // Get a list of all the params - either payment or cancel
  const params = allPaymentParamValuesPresent ? paymentParamValues : cancelParamValues
  return params
}

function extractMacCodeParam(redirectUrl) {
  let parsedUrl
  try {
    parsedUrl = new URL(redirectUrl)
  } catch (error) {
    throw new Error(`Unable to parse redirect URL [${redirectUrl}] - ${error.toString()}`)
  }
  const macCode = parsedUrl.searchParams.get('mac2')
  if (_.isEmpty(macCode)) {
    throw new Error(`No MAC code param [mac2] present on redirect URL [${redirectUrl}`)
  }
  return macCode
}

module.exports = {
  verifyMacCode,
  extractRedirectUrlParameters,
  generateMacCode,
  extractMacCodeParam,
}
