'use strict'

const { buildXmlFragment, buildWorldpayXml, WorldpayValidationException } = require('../../src/worldpay/xmlBuilder')

const validTestObj = {
  data: {
    foo: 'bar',
    boz: {
      '@att': 'baz',
    },
    cdata: { $: '<markup><here>' },
  },
  buildXmlData: function () {
    return { data: this.data }
  },
  isValid: function () {
    return true
  },
}

const invalidTestObj = {
  data: {
    foo: 'bar',
    boz: {
      '@att': 'baz',
    },
    cdata: { $: '<markup><here>' },
  },
  buildXmlData: function () {
    return { data: this.data }
  },
  isValid: function () {
    return false
  },
  validate: function () {
    return { error1: ['foo'], error2: ['bar', 'baz'] }
  },
}

test('should build XML fragment', () => {
  expect(buildXmlFragment(validTestObj)).toEqualXML(
    `<data>
      <foo>bar</foo>
      <boz att="baz"/>
      <cdata>
        <![CDATA[<markup><here>]]>
      </cdata>
    </data>`,
  )
})

test('should build full Worldpay XML document including DTD', () => {
  expect(buildWorldpayXml(validTestObj)).toEqualXML(
    `<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE data PUBLIC "-//WorldPay//DTD WorldPay PaymentService v1//EN" "http://dtd.worldpay.com/paymentService_v1.dtd">
    <data>
      <foo>bar</foo>
      <boz att="baz"/>
      <cdata>
        <![CDATA[<markup><here>]]>
      </cdata>
    </data>`,
  )
})

test('should fail to build XML fragment for object missing a buildXmlData method', () => {
  expect(() => {
    buildXmlFragment({})
  }).toThrow(Error)

  expect(() => {
    buildXmlFragment({ foo: 'bar' })
  }).toThrow(Error)
})

test('should fail to build full Worldpay XML for object missing a buildXmlData method', () => {
  expect(() => {
    buildWorldpayXml({})
  }).toThrow(Error)

  expect(() => {
    buildWorldpayXml({ foo: 'bar' })
  }).toThrow(Error)
})

test('should fail to build XML fragment when item fails validation', () => {
  expect(() => {
    buildXmlFragment(invalidTestObj)
  }).toThrow(WorldpayValidationException)

  // Verify exception message is flattened list of errors
  expect(() => {
    buildXmlFragment(invalidTestObj)
  }).toThrow('foo, bar, baz')
})

test('should fail to build XML when item fails validation', () => {
  expect(() => {
    buildWorldpayXml(invalidTestObj)
  }).toThrow(WorldpayValidationException)

  // Verify exception message is flattened list of errors
  expect(() => {
    buildWorldpayXml(invalidTestObj)
  }).toThrow('foo, bar, baz')
})
