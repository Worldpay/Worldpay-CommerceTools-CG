'use strict'

const WorldpayTokenisedCardPaymentDetails = require('../../src/worldpay/WorldpayTokenisedCardPaymentDetails')
const { buildXmlFragment } = require('../../src/worldpay/xmlBuilder')

describe('WorldpayTokenisedCardPaymentDetails', () => {
  test('Should be valid', () => {
    const tokenisedCard = new WorldpayTokenisedCardPaymentDetails('token', 'customer-1234', '0.0.0.0')
    expect(tokenisedCard.paymentTokenID).toEqual('token')
    expect(tokenisedCard.customerId).toEqual('customer-1234')
    expect(tokenisedCard.ipAddress).toEqual('0.0.0.0')
    expect(tokenisedCard.validate()).toBeUndefined()
    expect(tokenisedCard.isValid()).toBe(true)

    expect(buildXmlFragment(tokenisedCard)).toEqualXML(
      `<TOKEN-SSL tokenScope="shopper" captureCvc="true">
                <paymentTokenID>token</paymentTokenID>
            </TOKEN-SSL>
            <session shopperIPAddress="0.0.0.0" id="customer-1234"/>`,
    )
  })

  test('Should validate', () => {
    const ideal = new WorldpayTokenisedCardPaymentDetails()
    expect(ideal.isValid()).toBe(false)
    expect(ideal.validate()).toEqual(["PaymentTokenID can't be blank"])
  })
})
