'use strict'

const WorldpayLineItem = require('../../src/worldpay/WorldpayLineItem')
const { buildXmlFragment } = require('../../src/worldpay/xmlBuilder')

describe('WorldpayLineItem', () => {
  it('should generate an empty entity from the type property', () => {
    const lineItem = new WorldpayLineItem('shippingFee')
      .withReference('1234')
      .withName('Name of the item')
      .withQuantity(12)
      .withQuantityUnit(1)
      .withUnitPrice(500)
      .withTaxRate(1900)
      .withTotalAmount(6000)
      .withTotalTaxAmount(130)
      .withTotalDiscountAmount(200)
    const result = buildXmlFragment(lineItem)
    expect(result).toEqualXML(`
      <shippingFee/>
      <reference>1234</reference>
      <name>Name of the item</name>
      <quantity>12</quantity>
      <quantityUnit>1</quantityUnit>
      <unitPrice>500</unitPrice>
      <taxRate>1900</taxRate>
      <totalAmount>6000</totalAmount>
      <totalTaxAmount>130</totalTaxAmount>
      <totalDiscountAmount>200</totalDiscountAmount>
    `)
  })
})
