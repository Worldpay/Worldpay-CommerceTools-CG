'use strict'

const WorldpayAuthenticationRiskData = require('../../src/worldpay/WorldpayAuthenticationRiskData')
const { buildXmlFragment } = require('../../src/worldpay/xmlBuilder')

describe('AuthenticationRiskData', () => {
  test('should be valid with date and method', () => {
    const riskData = new WorldpayAuthenticationRiskData()
      .withAuthenticationMethod('guestCheckout')
      .withAuthenticationTimestamp(new Date('December 17, 1995 03:24:50'))

    expect(riskData.isValid()).toBe(true)
    expect(buildXmlFragment(riskData)).toEqualXML(
      `<authenticationRiskData authenticationMethod="guestCheckout">
        <authenticationTimestamp>
          <date second="50" minute="24" hour="3" dayOfMonth="17" month="12" year="1995"/>
        </authenticationTimestamp>
      </authenticationRiskData>`,
    )
  })

  test('should be valid with date', () => {
    const riskData = new WorldpayAuthenticationRiskData().withAuthenticationTimestamp(
      new Date('December 17, 1995 03:24:50'),
    )

    expect(riskData.isValid()).toBe(true)
    expect(buildXmlFragment(riskData)).toEqualXML(
      `<authenticationRiskData>
           <authenticationTimestamp>
            <date second="50" minute="24" hour="3" dayOfMonth="17" month="12" year="1995"/>
          </authenticationTimestamp>
         </authenticationRiskData>`,
    )
  })

  test('should be valid with method', () => {
    const riskData = new WorldpayAuthenticationRiskData().withAuthenticationMethod('guestCheckout')

    expect(riskData.isValid()).toBe(true)
    expect(buildXmlFragment(riskData)).toEqualXML(`<authenticationRiskData authenticationMethod="guestCheckout"/>`)
  })

  test('should be invalid when adding an invalid authenticationMethod', () => {
    const riskData = new WorldpayAuthenticationRiskData().withAuthenticationMethod('INVALID')
    expect(riskData.isValid()).toBe(false)
  })

  test('should throw error when date is not a date', () => {
    const riskData = new WorldpayAuthenticationRiskData().withAuthenticationTimestamp('not_a_date')
    expect(riskData.isValid()).toBe(false)

    expect(() => {
      riskData.buildXmlData()
    }).toThrow(Error)
  })

  test('should return undefined with no data', () => {
    const riskData = new WorldpayAuthenticationRiskData()
    expect(riskData.buildXmlData()).toBeUndefined()
  })
})
