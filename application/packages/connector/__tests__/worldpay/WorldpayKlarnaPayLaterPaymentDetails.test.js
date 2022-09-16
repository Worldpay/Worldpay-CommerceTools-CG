'use strict'

const WorldpayKlarnaPayLaterPaymentDetails = require('../../src/worldpay/WorldpayKlarnaPayLaterPaymentDetails')
const { buildXmlFragment } = require('../../src/worldpay/xmlBuilder')

describe('WorldpayKlarnaPayNowPaymentDetails', () => {
  test('Should be valid', () => {
    const laterPaymentDetails = new WorldpayKlarnaPayLaterPaymentDetails(
      'http://www.success.com/',
      'http://www.fail.com/',
      'http://www.cancel.com/',
      'http://www.pending.com/',
      'DE',
      'de-DE',
    )
    expect(laterPaymentDetails.successURL).toEqual('http://www.success.com/')
    expect(laterPaymentDetails.failureURL).toEqual('http://www.fail.com/')
    expect(laterPaymentDetails.cancelURL).toEqual('http://www.cancel.com/')
    expect(laterPaymentDetails.pendingURL).toEqual('http://www.pending.com/')
    expect(laterPaymentDetails.country).toEqual('DE')
    expect(laterPaymentDetails.locale).toEqual('de-DE')
    expect(laterPaymentDetails.validate()).toBeUndefined()
    expect(laterPaymentDetails.isValid()).toBe(true)

    expect(buildXmlFragment(laterPaymentDetails)).toEqualXML(
      `<KLARNA_PAYLATER-SSL shopperCountryCode="DE" locale="de-DE">
               <successURL>http://www.success.com/</successURL>
               <cancelURL>http://www.cancel.com/</cancelURL>
               <pendingURL>http://www.pending.com/</pendingURL>
               <failureURL>http://www.fail.com/</failureURL>
            </KLARNA_PAYLATER-SSL>`,
    )
  })

  test('Should validate', () => {
    const laterPaymentDetails = new WorldpayKlarnaPayLaterPaymentDetails()
    expect(laterPaymentDetails.isValid()).toBe(false)
    expect(laterPaymentDetails.validate()).toEqual([
      "SuccessURL can't be blank",
      "FailureURL can't be blank",
      "CancelURL can't be blank",
      "PendingURL can't be blank",
      "Country can't be blank",
      "Locale can't be blank",
    ])
  })
})
