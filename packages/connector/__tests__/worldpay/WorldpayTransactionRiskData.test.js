'use strict'

const WorldpayTransactionRiskData = require('../../lib/worldpay/WorldpayTransactionRiskData')
const { buildXmlFragment } = require('../../lib/worldpay/xmlBuilder')
const WP = require('../../lib/worldpay/constants')
const WorldpayAmount = require('../../lib/worldpay/WorldpayAmount')

describe('WorldpayTransactionRiskData', () => {
  test('should be valid with all data', () => {
    const riskData = new WorldpayTransactionRiskData()
      .withGiftCardAmount(new WorldpayAmount('GBP', 2500))
      .withPreOrderDate(new Date('May 14, 2004'))
      .withDeliveryEmailAddress('jon@acme.com')
      .withDeliveryTimeframe(WP.WORLDPAY_DELIVERY_TIMEFRAME_SAME_DAY_SHIPPING)
      .withGiftCardCount(7)
      .withPreOrderPurchase(true)
      .withReorderingPreviousPurchases(false)
      .withShippingMethod(WP.WORLDPAY_SHIPPING_METHOD_SHIP_TO_VERIFIED_ADDRES)

    expect(riskData.isValid()).toBe(true)
    expect(buildXmlFragment(riskData)).toEqualXML(
      `<transactionRiskData shippingMethod="shipToVerifiedAddress" deliveryTimeframe="sameDayShipping" deliveryEmailAddress="jon@acme.com" reorderingPreviousPurchases="false" preOrderPurchase="true" giftCardCount="7">
        <transactionRiskDataGiftCardAmount>
          <amount currencyCode="GBP" exponent="2" value="2500"/>
        </transactionRiskDataGiftCardAmount>
        <transactionRiskDataPreOrderDate>
          <date dayOfMonth="14" month="5" year="2004"/>
        </transactionRiskDataPreOrderDate>
      </transactionRiskData>`
    )
  })

  test('should be invalid when adding an invalid gift card amount', () => {
    const riskData = new WorldpayTransactionRiskData().withGiftCardAmount(
      new WorldpayAmount('ZZZ', -10)
    )
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid when adding an invalid PreOrderDate', () => {
    const riskData = new WorldpayTransactionRiskData().withPreOrderDate('not_a_date')
    expect(riskData.isValid()).toBe(false)
    expect(() => {
      riskData.buildXmlData()
    }).toThrow(Error)
  })

  test('should be invalid with invalid DeliveryEmailAddress', () => {
    let riskData = new WorldpayTransactionRiskData().withDeliveryEmailAddress('not_email_address')
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayTransactionRiskData().withDeliveryEmailAddress(7)
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayTransactionRiskData().withDeliveryEmailAddress(true)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid DeliveryTimeframe', () => {
    let riskData = new WorldpayTransactionRiskData().withDeliveryTimeframe('invalid')
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayTransactionRiskData().withDeliveryTimeframe(7)
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayTransactionRiskData().withDeliveryTimeframe(true)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid GiftCardCount', () => {
    let riskData = new WorldpayTransactionRiskData().withGiftCardCount('invalid')
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayTransactionRiskData().withGiftCardCount(-10)
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayTransactionRiskData().withGiftCardCount(2.5)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid PreOrderPurchase', () => {
    let riskData = new WorldpayTransactionRiskData().withPreOrderPurchase('invalid')
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayTransactionRiskData().withPreOrderPurchase(-10)
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayTransactionRiskData().withPreOrderPurchase(2.5)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid ReorderingPreviousPurchases', () => {
    let riskData = new WorldpayTransactionRiskData().withReorderingPreviousPurchases('invalid')
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayTransactionRiskData().withReorderingPreviousPurchases(-10)
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayTransactionRiskData().withReorderingPreviousPurchases(2.5)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid ShippingMethod', () => {
    let riskData = new WorldpayTransactionRiskData().withShippingMethod('invalid')
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayTransactionRiskData().withShippingMethod(-10)
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayTransactionRiskData().withShippingMethod(2.5)
    expect(riskData.isValid()).toBe(false)
  })

  test('should fail when adding an invalid amount object', () => {
    expect(() => {
      new WorldpayTransactionRiskData().withGiftCardAmount(250)
    }).toThrow(Error)
    expect(() => {
      new WorldpayTransactionRiskData().withGiftCardAmount({ foo: 'bar' })
    }).toThrow(Error)
  })

  test('should return undefined with no data', () => {
    const riskData = new WorldpayTransactionRiskData()
    expect(riskData.buildXmlData()).toBeUndefined()
  })
})
