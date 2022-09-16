'use strict'

const WorldpayKlarnaPayNowPaymentDetails = require('../../src/worldpay/WorldpayKlarnaPayNowPaymentDetails')
const { buildXmlFragment } = require('../../src/worldpay/xmlBuilder')

describe('WorldpayKlarnaPayNowPaymentDetails', () => {
  test('Should be valid', () => {
    const nowPaymentDetails = new WorldpayKlarnaPayNowPaymentDetails(
      'http://www.success.com/',
      'http://www.fail.com/',
      'http://www.cancel.com/',
      'http://www.pending.com/',
      'DE',
      'de-DE',
    )
    expect(nowPaymentDetails.successURL).toEqual('http://www.success.com/')
    expect(nowPaymentDetails.failureURL).toEqual('http://www.fail.com/')
    expect(nowPaymentDetails.cancelURL).toEqual('http://www.cancel.com/')
    expect(nowPaymentDetails.pendingURL).toEqual('http://www.pending.com/')
    expect(nowPaymentDetails.country).toEqual('DE')
    expect(nowPaymentDetails.locale).toEqual('de-DE')
    expect(nowPaymentDetails.validate()).toBeUndefined()
    expect(nowPaymentDetails.isValid()).toBe(true)

    expect(buildXmlFragment(nowPaymentDetails)).toEqualXML(
      `<KLARNA_PAYNOW-SSL shopperCountryCode="DE" locale="de-DE">
               <successURL>http://www.success.com/</successURL>
               <cancelURL>http://www.cancel.com/</cancelURL>
               <pendingURL>http://www.pending.com/</pendingURL>
               <failureURL>http://www.fail.com/</failureURL>
            </KLARNA_PAYNOW-SSL>`,
    )
  })

  test('Should validate', () => {
    const nowPaymentDetails = new WorldpayKlarnaPayNowPaymentDetails()
    expect(nowPaymentDetails.isValid()).toBe(false)
    expect(nowPaymentDetails.validate()).toEqual([
      "SuccessURL can't be blank",
      "FailureURL can't be blank",
      "CancelURL can't be blank",
      "PendingURL can't be blank",
      "Country can't be blank",
      "Locale can't be blank",
    ])
  })
})
