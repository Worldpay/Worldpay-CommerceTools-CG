'use strict'

const WorldpayKlarnaPaySlicedPaymentDetails = require('../../src/worldpay/WorldpayKlarnaPaySlicedPaymentDetails')
const { buildXmlFragment } = require('../../src/worldpay/xmlBuilder')

describe('WorldpayKlarnaPaySlicedPaymentDetails', () => {
  test('Should be valid', () => {
    const slicedPaymentDetails = new WorldpayKlarnaPaySlicedPaymentDetails(
      'http://www.success.com/',
      'http://www.fail.com/',
      'http://www.cancel.com/',
      'http://www.pending.com/',
      'DE',
      'de-DE',
    )
    expect(slicedPaymentDetails.successURL).toEqual('http://www.success.com/')
    expect(slicedPaymentDetails.failureURL).toEqual('http://www.fail.com/')
    expect(slicedPaymentDetails.cancelURL).toEqual('http://www.cancel.com/')
    expect(slicedPaymentDetails.pendingURL).toEqual('http://www.pending.com/')
    expect(slicedPaymentDetails.country).toEqual('DE')
    expect(slicedPaymentDetails.locale).toEqual('de-DE')
    expect(slicedPaymentDetails.validate()).toBeUndefined()
    expect(slicedPaymentDetails.isValid()).toBe(true)

    expect(buildXmlFragment(slicedPaymentDetails)).toEqualXML(
      `<KLARNA_SLICEIT-SSL shopperCountryCode="DE" locale="de-DE">
               <successURL>http://www.success.com/</successURL>
               <cancelURL>http://www.cancel.com/</cancelURL>
               <pendingURL>http://www.pending.com/</pendingURL>
               <failureURL>http://www.fail.com/</failureURL>
            </KLARNA_SLICEIT-SSL>`,
    )
  })

  test('Should validate', () => {
    const slicedPaymentDetails = new WorldpayKlarnaPaySlicedPaymentDetails()
    expect(slicedPaymentDetails.isValid()).toBe(false)
    expect(slicedPaymentDetails.validate()).toEqual([
      "SuccessURL can't be blank",
      "FailureURL can't be blank",
      "CancelURL can't be blank",
      "PendingURL can't be blank",
      "Country can't be blank",
      "Locale can't be blank",
    ])
  })
})
