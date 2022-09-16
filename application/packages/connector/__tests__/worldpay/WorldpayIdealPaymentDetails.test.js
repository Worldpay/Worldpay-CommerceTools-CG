'use strict'

const WorldpayIdealPaymentDetails = require('../../src/worldpay/WorldpayIdealPaymentDetails')
const { buildXmlFragment } = require('../../src/worldpay/xmlBuilder')

describe('WorldpayIdealPaymentDetails', () => {
  test('Should be valid', () => {
    const ideal = new WorldpayIdealPaymentDetails(
      'http://www.success.com/',
      'http://www.fail.com/',
      'http://www.cancel.com/',
      'http://www.pending.com/',
    ).withShopperBankCode('baco')
    expect(ideal.successURL).toEqual('http://www.success.com/')
    expect(ideal.failureURL).toEqual('http://www.fail.com/')
    expect(ideal.cancelURL).toEqual('http://www.cancel.com/')
    expect(ideal.pendingURL).toEqual('http://www.pending.com/')
    expect(ideal.shopperBankCode).toEqual('baco')
    expect(ideal.validate()).toBeUndefined()
    expect(ideal.isValid()).toBe(true)

    expect(buildXmlFragment(ideal)).toEqualXML(
      `<IDEAL-SSL shopperBankCode="baco">
               <successURL>http://www.success.com/</successURL>
               <failureURL>http://www.fail.com/</failureURL>
               <cancelURL>http://www.cancel.com/</cancelURL>
               <pendingURL>http://www.pending.com/</pendingURL>
            </IDEAL-SSL>`,
    )
  })

  test('Should validate', () => {
    const ideal = new WorldpayIdealPaymentDetails()
    expect(ideal.isValid()).toBe(false)
    expect(ideal.validate()).toEqual([
      "SuccessURL can't be blank",
      "FailureURL can't be blank",
      "CancelURL can't be blank",
      "PendingURL can't be blank",
      "ShopperBankCode can't be blank",
    ])
  })
})
