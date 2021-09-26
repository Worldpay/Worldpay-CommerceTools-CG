'use strict'

const WorldpayAddress = require('../../lib/worldpay/WorldpayAddress')
const { buildXmlFragment } = require('../../lib/worldpay/xmlBuilder')

describe('WorldpayShopper', () => {
  test('should be valid', () => {
    const address = new WorldpayAddress()
      .withAddress1('TEST_ADDRESS1')
      .withAddress2('TEST_ADDRESS2')
      .withAddress3('TEST_ADDRESS3')
      .withCity('TEST_CITY')
      .withPostalCode('ABC123')
      .withState('TEST_STATE')
      .withCountryCode('GB')
      .withTelephoneNumber('01234 567890')
    expect(address.address1).toEqual('TEST_ADDRESS1')
    expect(address.address2).toEqual('TEST_ADDRESS2')
    expect(address.address3).toEqual('TEST_ADDRESS3')
    expect(address.city).toEqual('TEST_CITY')
    expect(address.postalCode).toEqual('ABC123')
    expect(address.state).toEqual('TEST_STATE')
    expect(address.countryCode).toEqual('GB')
    expect(address.telephoneNumber).toEqual('01234 567890')
    expect(address.isValid()).toBe(true)

    expect(buildXmlFragment(address)).toEqualXML(
      `<address>
        <address1>TEST_ADDRESS1</address1>
        <address2>TEST_ADDRESS2</address2>
        <address3>TEST_ADDRESS3</address3>
        <postalCode>ABC123</postalCode>
        <city>TEST_CITY</city>
        <state>TEST_STATE</state>
        <countryCode>GB</countryCode>
        <telephoneNumber>01234 567890</telephoneNumber>
      </address>`
    )
  })

  test('should fail with missing data', () => {
    const address = new WorldpayAddress()
    expect(address.validate()).toEqual(
      expect.arrayContaining([
        "Address1 can't be blank",
        "City can't be blank",
        "Country code can't be blank",
        "Postal code can't be blank",
      ])
    )
    expect(address.isValid()).toBe(false)
  })
})
