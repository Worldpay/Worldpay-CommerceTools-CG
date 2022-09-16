'use strict'

const WorldpayAmount = require('../../src/worldpay/WorldpayAmount')
const { buildXmlFragment } = require('../../src/worldpay/xmlBuilder')

describe('WorldpayAmount', () => {
  test('should be empty', () => {
    const amount = new WorldpayAmount()
    expect(amount.currencyCode).toBeUndefined()
    expect(amount.value).toBeUndefined()
    expect(amount.isValid()).toBe(false)
    expect(amount.validate()).toEqual(
      expect.arrayContaining([
        "CurrencyCode can't be blank",
        'CurrencyCode [] is not a valid ISO4217 code',
        "Value can't be blank",
        "Exponent can't be blank",
      ]),
    )
  })

  test('should have valid currency', () => {
    const amount = new WorldpayAmount().withCurrencyCode('EUR')
    expect(amount.currencyCode).toEqual('EUR')
    expect(amount.value).toBeUndefined()
    expect(amount.exponent).toBeUndefined()
    expect(amount.isValid()).toBe(false)
  })

  test('should have valid currency and value', () => {
    const amount = new WorldpayAmount().withCurrencyCode('GBP').withValue(5000)
    expect(amount.currencyCode).toEqual('GBP')
    expect(amount.value).toBe(5000)
    expect(amount.exponent).toBe(2)
    expect(amount.isValid()).toBe(true)
    expect(buildXmlFragment(amount)).toEqualXML(`<amount currencyCode="GBP" exponent="2" value="5000"/>`)
  })

  test('should have valid currency and zero value', () => {
    const amount = new WorldpayAmount().withCurrencyCode('USD').withValue(0)
    expect(amount.currencyCode).toEqual('USD')
    expect(amount.value).toBe(0)
    expect(amount.exponent).toBe(2)
    expect(amount.isValid()).toBe(true)
    expect(buildXmlFragment(amount)).toEqualXML(`<amount currencyCode="USD" exponent="2" value="0"/>`)
  })

  test('should have valid currency and value and explicit exponent', () => {
    const amount = new WorldpayAmount().withCurrencyCode('GBP').withValue(5000, 1)
    expect(amount.currencyCode).toEqual('GBP')
    expect(amount.value).toBe(5000)
    expect(amount.exponent).toBe(1)
    expect(amount.isValid()).toBe(true)
    expect(buildXmlFragment(amount)).toEqualXML(`<amount currencyCode="GBP" exponent="1" value="5000"/>`)
  })

  test('should fail to create WorldpayAmount with invalid currency', () => {
    const amount = new WorldpayAmount().withCurrencyCode('ZZZ')
    expect(amount.validate()).toEqual(expect.arrayContaining(['CurrencyCode [ZZZ] is not a valid ISO4217 code']))
    expect(amount.isValid()).toBe(false)
  })

  test('should fail with invalid value', () => {
    const amount = new WorldpayAmount().withValue('XXX')
    expect(amount.validate()).toEqual(expect.arrayContaining(['Value is not a number']))
    expect(amount.isValid()).toBe(false)
  })

  test('should fail with non integer value', () => {
    const amount = new WorldpayAmount().withValue(123.45)
    expect(amount.validate()).toEqual(expect.arrayContaining(['Value must be an integer']))
    expect(amount.isValid()).toBe(false)
  })

  test('should fail with non integer exponent', () => {
    const amount = new WorldpayAmount().withValue(123, 0.5)
    expect(amount.validate()).toEqual(expect.arrayContaining(['Exponent must be an integer']))
    expect(amount.isValid()).toBe(false)
  })

  test('should fail with exponent > 20', () => {
    const amount = new WorldpayAmount().withValue(123, 21)
    expect(amount.validate()).toEqual(expect.arrayContaining(['Exponent must be lessThanOrEqualTo 20']))
    expect(amount.isValid()).toBe(false)
  })

  test('should fail with negative exponent', () => {
    const amount = new WorldpayAmount().withValue(123, -1)
    expect(amount.validate()).toEqual(expect.arrayContaining(['Exponent must be greaterThanOrEqualTo 0']))
    expect(amount.isValid()).toBe(false)
  })
})
