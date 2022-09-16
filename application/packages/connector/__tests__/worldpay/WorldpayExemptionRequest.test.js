'use strict'

const WorldpayExemptionRequest = require('../../src/worldpay/WorldpayExemptionRequest')
const { buildXmlFragment } = require('../../src/worldpay/xmlBuilder')
const WP = require('../../src/worldpay/constants')

describe('WorldpayIdealPaymentDetails', () => {
  test('Should be valid', () => {
    const exemption = new WorldpayExemptionRequest()
      .withType(WP.WORLDPAY_EXEMPTION_TYPE_LV)
      .withPlacement(WP.WORLDPAY_EXEMPTION_PLACEMENT_AUTHORISATION)
    expect(exemption.type).toEqual('LV')
    expect(exemption.placement).toEqual('AUTHORISATION')
    expect(exemption.validate()).toBeUndefined()
    expect(exemption.isValid()).toBe(true)

    expect(buildXmlFragment(exemption)).toEqualXML(`<exemption type="LV" placement="AUTHORISATION"/>`)
  })

  test('Should validate', () => {
    const exemption = new WorldpayExemptionRequest()
    expect(exemption.isValid()).toBe(false)
    expect(exemption.validate()).toEqual(["Type can't be blank", "Placement can't be blank"])
  })

  test('Should validate strictly for accepted values', () => {
    const exemption = new WorldpayExemptionRequest().withType('some').withPlacement('some')
    expect(exemption.isValid()).toBe(false)
    expect(exemption.validate()).toEqual(['some is not included in the list'])
  })
})
