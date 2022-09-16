'use strict'

const WorldpayPayPalPaymentDetails = require('../../src/worldpay/WorldpayPayPalPaymentDetails')
const { buildXmlFragment } = require('../../src/worldpay/xmlBuilder')

describe('WorldpayPaypalPaymentDetails', () => {
  test('should be valid', () => {
    const successURL = 'https://success.com'
    const failureURL = 'https://failure.com'
    const cancelURL = 'https://cancel.com'
    const paypalDetails = new WorldpayPayPalPaymentDetails(successURL, failureURL, cancelURL)
    expect(paypalDetails.successURL).toEqual('https://success.com')
    expect(paypalDetails.failureURL).toEqual('https://failure.com')
    expect(paypalDetails.cancelURL).toEqual('https://cancel.com')

    expect(buildXmlFragment(paypalDetails)).toEqualXML(
      `<PAYPAL-EXPRESS>
        <successURL>https://success.com</successURL>
        <failureURL>https://failure.com</failureURL>
        <cancelURL>https://cancel.com</cancelURL>
      </PAYPAL-EXPRESS>`,
    )
  })

  test('should fail with missing return URLs', () => {
    const paypalDetails = new WorldpayPayPalPaymentDetails()
    expect(paypalDetails.validate()).toBeDefined()
    expect(paypalDetails.validate()).toEqual(
      expect.arrayContaining(["SuccessURL can't be blank", "FailureURL can't be blank", "CancelURL can't be blank"]),
    )
  })
})
