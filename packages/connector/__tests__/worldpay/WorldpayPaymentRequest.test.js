'use strict'

const WorldpayPaymentRequest = require('../../lib/worldpay/WorldpayPaymentRequest')
const WorldpayAmount = require('../../lib/worldpay/WorldpayAmount')
const WorldpayShopper = require('../../lib/worldpay/WorldpayShopper')
const xmlBuilder = require('../../lib/worldpay/xmlBuilder')
const WP = require('../../lib/worldpay/constants')
const WorldpayAddress = require('../../lib/worldpay/WorldpayAddress')
const { WorldpayValidationException } = require('../../lib/worldpay/xmlBuilder')
const WorldpayPaymentMethodMask = require('../../lib/worldpay/WorldpayPaymentMethodMask')
const WorldpayAuthenticationRiskData = require('../../lib/worldpay/WorldpayAuthenticationRiskData')
const WorldpayShopperAccountRiskData = require('../../lib/worldpay/WorldpayShopperAccountRiskData')
const WorldpayTransactionRiskData = require('../../lib/worldpay/WorldpayTransactionRiskData')
const WorldpayFraudSightData = require('../../lib/worldpay/WorldpayFraudSightData')

describe('WorldpayPaymentRequest', () => {
  test('should be valid full Worldpay XML with all optional data added', () => {
    const payment = new WorldpayPaymentRequest('TESTMERCHCODE', 'TESTINSTALLATION')
      .withOrderDetails('TESTORDERCODE', 'TEST_ORDER_DESC')
      .withOrderContent('TEST_ORDER_CONTENT')
      .withCaptureDelay(WP.WORLDPAY_ORDER_CAPTURE_DELAY_AUTOMATIC)
      .withPaymentMethodMask(new WorldpayPaymentMethodMask().includeAll())
      .withPaymentAmount(new WorldpayAmount('GBP', 2500))
      .withShopperDetails(
        new WorldpayShopper('bob@foo.com').withBrowserAcceptHeader('ACCEPT_HEADER')
      )
      .withShippingAddress(
        new WorldpayAddress()
          .withAddress1('123 Some Street')
          .withCity('Smallville')
          .withPostalCode('ABC 123')
          .withCountryCode('US')
      )
      .withBillingAddress(
        new WorldpayAddress()
          .withAddress1('456 Another Street')
          .withCity('Big Town')
          .withPostalCode('DEF 456')
          .withCountryCode('GB')
      )
      .withAuthenticationRiskData(
        new WorldpayAuthenticationRiskData()
          .withAuthenticationMethod('guestCheckout')
          .withAuthenticationTimestamp(new Date('December 25, 2020 03:24:50'))
      )
      .withShopperAccountRiskData(
        new WorldpayShopperAccountRiskData()
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
      )
      .withTransactionRiskData(
        new WorldpayTransactionRiskData()
          .withGiftCardAmount(new WorldpayAmount('GBP', 2500))
          .withPreOrderDate(new Date('May 14, 2004'))
          .withDeliveryEmailAddress('jon@acme.com')
          .withDeliveryTimeframe(WP.WORLDPAY_DELIVERY_TIMEFRAME_SAME_DAY_SHIPPING)
          .withGiftCardCount(7)
          .withPreOrderPurchase(true)
          .withReorderingPreviousPurchases(false)
          .withShippingMethod(WP.WORLDPAY_SHIPPING_METHOD_SHIP_TO_VERIFIED_ADDRES)
      )
      .withFraudSightData(
        new WorldpayFraudSightData()
          .withShopperAddress(
            new WorldpayAddress()
              .withAddress1('66 Fraud Street')
              .withCity('Fraud City')
              .withPostalCode('FRA UD1')
              .withCountryCode('FR')
          )
          .withShopperId('my-shopper-id')
          .withShopperName('Money Stealer')
      )

    expect(payment.isValid()).toBe(true)
    expect(payment.validate()).toBeUndefined()
    const xml = xmlBuilder.buildWorldpayXml(payment)
    //console.log(xml)
    expect(xml).toEqualXML(`
      <?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE paymentService PUBLIC "-//Worldpay//DTD Worldpay PaymentService v1//EN" "http://dtd.worldpay.com/paymentService_v1.dtd">
      <paymentService version="1.4" merchantCode="TESTMERCHCODE">
        <submit>
          <order orderCode="TESTORDERCODE" installationId="TESTINSTALLATION" captureDelay="0">
            <description>TEST_ORDER_DESC</description>
            <amount currencyCode="GBP" exponent="2" value="2500"/>
            <orderContent><![CDATA[TEST_ORDER_CONTENT]]></orderContent>
            <paymentMethodMask>
              <include code="ALL"/>
            </paymentMethodMask>
            <shopper>
              <shopperEmailAddress>bob@foo.com</shopperEmailAddress>
              <browser>
                <acceptHeader>ACCEPT_HEADER</acceptHeader>
              </browser>
            </shopper>
            <shippingAddress>
              <address>
                <address1>123 Some Street</address1>
                <postalCode>ABC 123</postalCode>
                <city>Smallville</city>
                <countryCode>US</countryCode>
              </address>
            </shippingAddress>
            <billingAddress>
              <address>
                <address1>456 Another Street</address1>
                <postalCode>DEF 456</postalCode>
                <city>Big Town</city>
                <countryCode>GB</countryCode>
              </address>
            </billingAddress>
            <riskData>
              <authenticationRiskData authenticationMethod="guestCheckout">
                <authenticationTimestamp>
                  <date second="50" minute="24" hour="3" dayOfMonth="25" month="12" year="2020"/>
                </authenticationTimestamp>
              </authenticationRiskData>
              <shopperAccountRiskData transactionsAttemptedLastDay="5" transactionsAttemptedLastYear="15" purchasesCompletedLastSixMonths="25" addCardAttemptsLastDay="35" previousSuspiciousActivity="false" shippingNameMatchesAccountName="true" shopperAccountAgeIndicator="createdDuringTransaction" shopperAccountChangeIndicator="lessThanThirtyDays" shopperAccountPasswordChangeIndicator="thirtyToSixtyDays" shopperAccountShippingAddressUsageIndicator="moreThanSixtyDays" shopperAccountPaymentAccountIndicator="noAccount">
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
              </shopperAccountRiskData>
              <transactionRiskData shippingMethod="shipToVerifiedAddress" deliveryTimeframe="sameDayShipping" deliveryEmailAddress="jon@acme.com" reorderingPreviousPurchases="false" preOrderPurchase="true" giftCardCount="7">
                <transactionRiskDataGiftCardAmount>
                  <amount currencyCode="GBP" exponent="2" value="2500"/>
                </transactionRiskDataGiftCardAmount>
                <transactionRiskDataPreOrderDate>
                  <date dayOfMonth="14" month="5" year="2004"/>
                </transactionRiskDataPreOrderDate>
              </transactionRiskData>
            </riskData>
            <FraudSightData>
              <shopperFields>
                <shopperName>Money Stealer</shopperName>
                <shopperId>my-shopper-id</shopperId>
                <shopperAddress>
                  <address>
                    <address1>66 Fraud Street</address1>
                    <postalCode>FRA UD1</postalCode>
                    <city>Fraud City</city>
                    <countryCode>FR</countryCode>
                  </address>
                </shopperAddress>
              </shopperFields>
            </FraudSightData>
          </order>
        </submit>
      </paymentService>`)
    //console.log(xml)
  })

  test('should be valid full Worldpay XML with only mandatory elements', () => {
    const payment = new WorldpayPaymentRequest('TESTMERCHCODE', 'TESTINSTALLATION')
      .withOrderDetails('TESTORDERCODE', 'TEST_ORDER_DESC')
      .withPaymentMethodMask(new WorldpayPaymentMethodMask().includeOnline())
      .withPaymentAmount(new WorldpayAmount('GBP', 2500))
      .withShopperDetails(new WorldpayShopper('bob@foo.com'))

    expect(payment.isValid()).toBe(true)
    expect(payment.validate()).toBeUndefined()
    const xml = xmlBuilder.buildWorldpayXml(payment)

    expect(xml).toEqualXML(`
      <?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE paymentService PUBLIC "-//Worldpay//DTD Worldpay PaymentService v1//EN" "http://dtd.worldpay.com/paymentService_v1.dtd">
      <paymentService version="1.4" merchantCode="TESTMERCHCODE">
        <submit>
          <order orderCode="TESTORDERCODE" installationId="TESTINSTALLATION">
            <description>TEST_ORDER_DESC</description>
            <amount currencyCode="GBP" exponent="2" value="2500"/>
            <paymentMethodMask>
              <include code="ONLINE"/>
            </paymentMethodMask>
            <shopper>
              <shopperEmailAddress>bob@foo.com</shopperEmailAddress>
            </shopper>
          </order>
        </submit>
      </paymentService>`)
  })

  test('should be valid full Worldpay XML with mandatory elements and risk data', () => {
    const payment = new WorldpayPaymentRequest('TESTMERCHCODE', 'TESTINSTALLATION')
      .withOrderDetails('TESTORDERCODE', 'TEST_ORDER_DESC')
      .withPaymentMethodMask(new WorldpayPaymentMethodMask().includeOnline())
      .withPaymentAmount(new WorldpayAmount('GBP', 2500))
      .withShopperDetails(new WorldpayShopper('bob@foo.com'))
      .withAuthenticationRiskData(
        new WorldpayAuthenticationRiskData()
          .withAuthenticationMethod(WP.WORLDPAY_AUTHENTICATION_METHOD_GUEST_CHECKOUT)
          .withAuthenticationTimestamp(new Date('February 11, 2001 01:23:45'))
      )
      .withShopperAccountRiskData(
        new WorldpayShopperAccountRiskData()
          .withAddCardAttemptsLastDay(7)
          .withPreviousSuspiciousActivity(false)
          .withShopperAccountCreationDate(new Date('January 19, 2020'))
      )

    expect(payment.isValid()).toBe(true)
    expect(payment.validate()).toBeUndefined()
    const xml = xmlBuilder.buildWorldpayXml(payment)

    expect(xml).toEqualXML(`
      <?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE paymentService PUBLIC "-//Worldpay//DTD Worldpay PaymentService v1//EN" "http://dtd.worldpay.com/paymentService_v1.dtd">
      <paymentService version="1.4" merchantCode="TESTMERCHCODE">
        <submit>
          <order orderCode="TESTORDERCODE" installationId="TESTINSTALLATION">
            <description>TEST_ORDER_DESC</description>
            <amount currencyCode="GBP" exponent="2" value="2500"/>
            <paymentMethodMask>
              <include code="ONLINE"/>
            </paymentMethodMask>
            <shopper>
              <shopperEmailAddress>bob@foo.com</shopperEmailAddress>
            </shopper>
            <riskData>
              <authenticationRiskData authenticationMethod="guestCheckout">
                <authenticationTimestamp>
                  <date second="45" minute="23" hour="1" dayOfMonth="11" month="2" year="2001"/>
                </authenticationTimestamp>
              </authenticationRiskData>
              <shopperAccountRiskData addCardAttemptsLastDay="7" previousSuspiciousActivity="false">
                <shopperAccountCreationDate>
                  <date dayOfMonth="19" month="1" year="2020"/>
                </shopperAccountCreationDate>
              </shopperAccountRiskData>
            </riskData>
          </order>
        </submit>
      </paymentService>`)
  })

  test('should be invalid with all missing properties', () => {
    const payment = new WorldpayPaymentRequest()
    expect(payment.validate()).toEqual(
      expect.arrayContaining([
        "Amount can't be blank",
        "Installation id can't be blank",
        "Merchant code can't be blank",
        "Order code can't be blank",
        "Order description can't be blank",
        "Payment method mask can't be blank",
        "Shopper can't be blank",
      ])
    )

    expect(payment.isValid()).toBe(false)
  })

  test('should fail when adding an invalid amount object', () => {
    expect(() => {
      new WorldpayPaymentRequest().withPaymentAmount(250)
    }).toThrow(Error)
    expect(() => {
      new WorldpayPaymentRequest().withPaymentAmount({ foo: 'bar' })
    }).toThrow(Error)
  })

  test('should fail when adding an invalid shopper object', () => {
    expect(() => {
      new WorldpayPaymentRequest().withShopperDetails('bob')
    }).toThrow(Error)
    expect(() => {
      new WorldpayPaymentRequest().withShopperDetails({ foo: 'bar' })
    }).toThrow(Error)
  })

  test('should fail when adding an invalid billingAddress object', () => {
    expect(() => {
      new WorldpayPaymentRequest().withBillingAddress('bob')
    }).toThrow(Error)
    expect(() => {
      new WorldpayPaymentRequest().withBillingAddress({ foo: 'bar' })
    }).toThrow(Error)
  })

  test('should fail when adding an invalid shippingAddress object', () => {
    expect(() => {
      new WorldpayPaymentRequest().withShippingAddress('bob')
    }).toThrow(Error)
    expect(() => {
      new WorldpayPaymentRequest().withShippingAddress({ foo: 'bar' })
    }).toThrow(Error)
  })

  test('should fail when adding an invalid paymentMethodMask object', () => {
    expect(() => {
      new WorldpayPaymentRequest().withPaymentMethodMask({})
    }).toThrow(Error)
  })

  test('should fail when adding an invalid authenticationRiskData object', () => {
    expect(() => {
      new WorldpayPaymentRequest().withAuthenticationRiskData({})
    }).toThrow(Error)
  })

  test('should fail when adding an invalid shopperAccountRiskData object', () => {
    expect(() => {
      new WorldpayPaymentRequest().withShopperAccountRiskData({})
    }).toThrow(Error)
  })

  test('should fail when adding an invalid transactionRiskData object', () => {
    expect(() => {
      new WorldpayPaymentRequest().withTransactionRiskData({})
    }).toThrow(Error)
  })

  test('should fail when adding an invalid fraugSightData object', () => {
    expect(() => {
      new WorldpayPaymentRequest().withFraudSightData({})
    }).toThrow(new Error('fraudSightData should be of type WorldpayFraudSightData'))
  })

  test('should fail to build XML when validation fails', () => {
    expect(() => {
      xmlBuilder.buildWorldpayXml(new WorldpayPaymentRequest())
    }).toThrow(WorldpayValidationException)
  })

  test('should be invalid with only authentication risk data', () => {
    const payment = new WorldpayPaymentRequest().withAuthenticationRiskData(
      new WorldpayAuthenticationRiskData()
        .withAuthenticationMethod('guestCheckout')
        .withAuthenticationTimestamp(new Date('December 25, 2020 03:24:50'))
    )
    expect(payment.isValid()).toBe(false)
    const riskData = payment.buildRiskData()
    expect(riskData).toBeDefined()
  })

  test('should be invalid with only shopper risk data', () => {
    const payment = new WorldpayPaymentRequest().withShopperAccountRiskData(
      new WorldpayShopperAccountRiskData().withShopperAccountCreationDate(
        new Date('January 10, 2000 01:23:45')
      )
    )
    expect(payment.isValid()).toBe(false)
    const riskData = payment.buildRiskData()
    expect(riskData).toBeDefined()
  })

  test('should be invalid with only transaction risk data', () => {
    const payment = new WorldpayPaymentRequest().withTransactionRiskData(
      new WorldpayTransactionRiskData().withDeliveryEmailAddress('jon@foo.com')
    )
    expect(payment.isValid()).toBe(false)
    const riskData = payment.buildRiskData()
    expect(riskData).toBeDefined()
  })

  test('should have no risk data', () => {
    const payment = new WorldpayPaymentRequest()

    expect(payment.isValid()).toBe(false)
    const riskData = payment.buildRiskData()
    expect(riskData).toBeUndefined()
  })
})
