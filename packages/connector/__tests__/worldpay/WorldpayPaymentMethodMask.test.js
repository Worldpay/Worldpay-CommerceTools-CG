'use strict'

const WorldpayPaymentMethodMask = require('../../lib/worldpay/WorldpayPaymentMethodMask')
const { buildXmlFragment } = require('../../lib/worldpay/xmlBuilder')

describe('WorldpayPaymentMethodMask', () => {
  test('should be valid with single include', () => {
    const pmm = new WorldpayPaymentMethodMask('FOO')
    expect(pmm.include).toEqual(['FOO'])
    expect(pmm.exclude).toBeUndefined()
    expect(pmm.validate()).toBeUndefined()
    expect(pmm.isValid()).toBe(true)

    expect(buildXmlFragment(pmm)).toEqualXML(
      `<paymentMethodMask>
        <include code="FOO"/>
      </paymentMethodMask>`
    )
  })

  test('should be valid with single include as array', () => {
    const pmm = new WorldpayPaymentMethodMask(['FOO'])
    expect(pmm.include).toEqual(['FOO'])
    expect(pmm.exclude).toBeUndefined()
    expect(pmm.validate()).toBeUndefined()
    expect(pmm.isValid()).toBe(true)

    expect(buildXmlFragment(pmm)).toEqualXML(
      `<paymentMethodMask>
        <include code="FOO"/>
      </paymentMethodMask>`
    )
  })

  test('should be valid with multiple includes', () => {
    const pmm = new WorldpayPaymentMethodMask(['FOO', 'BAR', 'BAZ'])
    expect(pmm.include).toEqual(['FOO', 'BAR', 'BAZ'])
    expect(pmm.exclude).toBeUndefined()
    expect(pmm.validate()).toBeUndefined()
    expect(pmm.isValid()).toBe(true)

    expect(buildXmlFragment(pmm)).toEqualXML(
      `<paymentMethodMask>
        <include code="FOO"/>
        <include code="BAR"/>
        <include code="BAZ"/>
      </paymentMethodMask>`
    )
  })

  test('should be valid with multiple includes and single exclude', () => {
    const pmm = new WorldpayPaymentMethodMask(['FOO', 'BAR', 'BAZ'], 'BOP')
    expect(pmm.include).toEqual(['FOO', 'BAR', 'BAZ'])
    expect(pmm.exclude).toEqual(['BOP'])
    expect(pmm.validate()).toBeUndefined()
    expect(pmm.isValid()).toBe(true)

    expect(buildXmlFragment(pmm)).toEqualXML(
      `<paymentMethodMask>
        <include code="FOO"/>
        <include code="BAR"/>
        <include code="BAZ"/>
        <exclude code="BOP"/>
      </paymentMethodMask>`
    )
  })

  test('should be valid with multiple includes and multiple excludes', () => {
    const pmm = new WorldpayPaymentMethodMask(['FOO', 'BAR', 'BAZ'], ['BOP', 'BIP'])
    expect(pmm.include).toEqual(['FOO', 'BAR', 'BAZ'])
    expect(pmm.exclude).toEqual(['BOP', 'BIP'])
    expect(pmm.validate()).toBeUndefined()
    expect(pmm.isValid()).toBe(true)

    expect(buildXmlFragment(pmm)).toEqualXML(
      `<paymentMethodMask>
        <include code="FOO"/>
        <include code="BAR"/>
        <include code="BAZ"/>
        <exclude code="BOP"/>
        <exclude code="BIP"/>
      </paymentMethodMask>`
    )
  })

  test('should be valid with ALL', () => {
    const pmm = new WorldpayPaymentMethodMask().includeAll()
    expect(pmm.include).toEqual(['ALL'])
    expect(pmm.exclude).toBeUndefined()
    expect(pmm.validate()).toBeUndefined()
    expect(pmm.isValid()).toBe(true)

    expect(buildXmlFragment(pmm)).toEqualXML(
      `<paymentMethodMask>
        <include code="ALL"/>
      </paymentMethodMask>`
    )
  })

  test('should be valid with ONLINE', () => {
    const pmm = new WorldpayPaymentMethodMask().includeOnline()
    expect(pmm.include).toEqual(['ONLINE'])
    expect(pmm.exclude).toBeUndefined()
    expect(pmm.validate()).toBeUndefined()
    expect(pmm.isValid()).toBe(true)

    expect(buildXmlFragment(pmm)).toEqualXML(
      `<paymentMethodMask>
        <include code="ONLINE"/>
      </paymentMethodMask>`
    )
  })

  test('should fail with missing include element', () => {
    const pmm = new WorldpayPaymentMethodMask()
    expect(pmm.include).toBeUndefined()
    expect(pmm.exclude).toBeUndefined()
    expect(pmm.isValid()).toBe(false)
    expect(pmm.validate()).toEqual(expect.arrayContaining(["Include can't be blank"]))
  })

  test('should fail with missing include element for empty array', () => {
    const pmm = new WorldpayPaymentMethodMask([])
    expect(pmm.include).toBeUndefined()
    expect(pmm.exclude).toBeUndefined()
    expect(pmm.isValid()).toBe(false)
    expect(pmm.validate()).toEqual(expect.arrayContaining(["Include can't be blank"]))
  })

  test('should build XML data with no include or exclude elements', () => {
    const pmm = new WorldpayPaymentMethodMask()

    expect(pmm.buildXmlData()).toMatchObject({
      paymentMethodMask: {
        include: undefined,
        exclude: undefined,
      },
    })
  })
})
