'use strict'

const WorldpayShopperAccountRiskData = require('../../lib/worldpay/WorldpayShopperAccountRiskData')
const { buildXmlFragment } = require('../../lib/worldpay/xmlBuilder')
const WP = require('../../lib/worldpay/constants')

describe('ShopperAccountRiskData', () => {
  test('should be valid with all data', () => {
    const riskData = new WorldpayShopperAccountRiskData()
      .withShopperAccountCreationDate(new Date('January 10, 2000 01:23:45'))
      .withShopperAccountModificationDate(new Date('February 11, 2001 01:23:45'))
      .withShopperAccountPasswordChangeDate(new Date('March 12, 2002 01:23:45'))
      .withShopperAccountShippingAddressFirstUseDate(new Date('April 13, 2003 01:23:45'))
      .withShopperAccountPaymentAccountFirstUseDate(new Date('May 14, 2004 01:23:45'))
      .withTransactionsAttemptedLastDay(5)
      .withTransactionsAttemptedLastYear(15)
      .withPurchasesCompletedLastSixMonths(25)
      .withAddCardAttemptsLastDay(35)
      .withPreviousSuspiciousActivity(false)
      .withShippingNameMatchesAccountName(true)
      .withShopperAccountAgeIndicator(WP.WORLDPAY_ACCOUNT_INDICATOR_CREATED_DURING_TRANSACTION)
      .withShopperAccountChangeIndicator(WP.WORLDPAY_ACCOUNT_INDICATOR_LESS_THAN_THIRTY_DAYS)
      .withShopperAccountPasswordChangeIndicator(
        WP.WORLDPAY_ACCOUNT_INDICATOR_LESS_THIRTY_TO_SIXTY_DAYS
      )
      .withShopperAccountShippingAddressUsageIndicator(
        WP.WORLDPAY_ACCOUNT_INDICATOR_MORE_THAN_SIXTY_DAYS
      )
      .withShopperAccountPaymentAccountIndicator(WP.WORLDPAY_ACCOUNT_INDICATOR_NO_ACCOUNT)

    expect(riskData.isValid()).toBe(true)
    expect(buildXmlFragment(riskData)).toEqualXML(
      `<shopperAccountRiskData transactionsAttemptedLastDay="5" transactionsAttemptedLastYear="15" purchasesCompletedLastSixMonths="25" addCardAttemptsLastDay="35" previousSuspiciousActivity="false" shippingNameMatchesAccountName="true" shopperAccountAgeIndicator="createdDuringTransaction" shopperAccountChangeIndicator="lessThanThirtyDays" shopperAccountPasswordChangeIndicator="thirtyToSixtyDays" shopperAccountShippingAddressUsageIndicator="moreThanSixtyDays" shopperAccountPaymentAccountIndicator="noAccount">
          <shopperAccountCreationDate>
            <date dayOfMonth="10" month="1" year="2000"/>
          </shopperAccountCreationDate>
          <shopperAccountModificationDate>
            <date dayOfMonth="11" month="2" year="2001"/>
          </shopperAccountModificationDate>
          <shopperAccountPasswordChangeDate>
            <date dayOfMonth="12" month="3" year="2002"/>
          </shopperAccountPasswordChangeDate>
          <shopperAccountShippingAddressFirstUseDate>
            <date dayOfMonth="13" month="4" year="2003"/>
          </shopperAccountShippingAddressFirstUseDate>
          <shopperAccountPaymentAccountFirstUseDate>
            <date dayOfMonth="14" month="5" year="2004"/>
          </shopperAccountPaymentAccountFirstUseDate>
        </shopperAccountRiskData>`
    )
  })

  test('should be valid with some data', () => {
    const riskData = new WorldpayShopperAccountRiskData()
      .withShopperAccountCreationDate(new Date('January 10, 2000 01:23:45'))
      .withShopperAccountPasswordChangeDate(new Date('March 12, 2002 01:23:45'))
      .withShopperAccountPaymentAccountFirstUseDate(new Date('May 14, 2004 01:23:45'))
      .withTransactionsAttemptedLastDay(5)
      .withShippingNameMatchesAccountName(true)

    expect(riskData.isValid()).toBe(true)
    expect(buildXmlFragment(riskData)).toEqualXML(
      `<shopperAccountRiskData transactionsAttemptedLastDay="5" shippingNameMatchesAccountName="true">
          <shopperAccountCreationDate>
            <date dayOfMonth="10" month="1" year="2000"/>
          </shopperAccountCreationDate>
          <shopperAccountPasswordChangeDate>
            <date dayOfMonth="12" month="3" year="2002"/>
          </shopperAccountPasswordChangeDate>
          <shopperAccountPaymentAccountFirstUseDate>
            <date dayOfMonth="14" month="5" year="2004"/>
          </shopperAccountPaymentAccountFirstUseDate>
        </shopperAccountRiskData>`
    )
  })

  test('should throw error when date is not a date', () => {
    const riskData = new WorldpayShopperAccountRiskData().withShopperAccountCreationDate(
      'not_a_date'
    )
    expect(riskData.isValid()).toBe(false)
    expect(() => {
      riskData.buildXmlData()
    }).toThrow(Error)
  })

  test('should return undefined with no data', () => {
    const riskData = new WorldpayShopperAccountRiskData()
    expect(riskData.buildXmlData()).toBeUndefined()
  })

  test('should be invalid with invalid value for AddCardAttemptsLastDay', () => {
    let riskData = new WorldpayShopperAccountRiskData().withAddCardAttemptsLastDay('invalid')
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withAddCardAttemptsLastDay(-1)
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withAddCardAttemptsLastDay(0.5)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid value for PurchasesCompletedLastSixMonths', () => {
    let riskData = new WorldpayShopperAccountRiskData().withPurchasesCompletedLastSixMonths(
      'invalid'
    )
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withPurchasesCompletedLastSixMonths(-1)
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withPurchasesCompletedLastSixMonths(0.5)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid value for TransactionsAttemptedLastDay', () => {
    let riskData = new WorldpayShopperAccountRiskData().withTransactionsAttemptedLastDay('invalid')
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withTransactionsAttemptedLastDay(-1)
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withTransactionsAttemptedLastDay(0.5)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid value for TransactionsAttemptedLastYear', () => {
    let riskData = new WorldpayShopperAccountRiskData().withTransactionsAttemptedLastYear('invalid')
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withTransactionsAttemptedLastYear(-1)
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withTransactionsAttemptedLastYear(0.5)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid value for PreviousSuspiciousActivity', () => {
    let riskData = new WorldpayShopperAccountRiskData().withPreviousSuspiciousActivity('invalid')
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withPreviousSuspiciousActivity(10)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid value for ShippingNameMatchesAccountName', () => {
    let riskData = new WorldpayShopperAccountRiskData().withShippingNameMatchesAccountName(
      'invalid'
    )
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withShippingNameMatchesAccountName(10)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid value for ShopperAccountAgeIndicator', () => {
    let riskData = new WorldpayShopperAccountRiskData().withShopperAccountAgeIndicator('invalid')
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withShopperAccountAgeIndicator(10)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid value for ShopperAccountChangeIndicator', () => {
    let riskData = new WorldpayShopperAccountRiskData().withShopperAccountChangeIndicator('invalid')
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withShopperAccountChangeIndicator(10)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid value for ShopperAccountPasswordChangeIndicator', () => {
    let riskData = new WorldpayShopperAccountRiskData().withShopperAccountPasswordChangeIndicator(
      'invalid'
    )
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withShopperAccountPasswordChangeIndicator(10)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid value for ShopperAccountPaymentAccountIndicator', () => {
    let riskData = new WorldpayShopperAccountRiskData().withShopperAccountPaymentAccountIndicator(
      'invalid'
    )
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withShopperAccountPaymentAccountIndicator(10)
    expect(riskData.isValid()).toBe(false)
  })

  test('should be invalid with invalid value for ShopperAccountShippingAddressUsageIndicator', () => {
    let riskData =
      new WorldpayShopperAccountRiskData().withShopperAccountShippingAddressUsageIndicator(
        'invalid'
      )
    expect(riskData.isValid()).toBe(false)
    riskData = new WorldpayShopperAccountRiskData().withShopperAccountShippingAddressUsageIndicator(
      10
    )
    expect(riskData.isValid()).toBe(false)
  })
})
