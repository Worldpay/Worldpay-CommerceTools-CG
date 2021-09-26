'use strict'

const WorldpayAddress = require('../../lib/worldpay/WorldpayAddress')
const WorldpayFraudSightData = require('../../lib/worldpay/WorldpayFraudSightData')
const { buildXmlFragment } = require('../../lib/worldpay/xmlBuilder')

describe('WorldpayFraudSightData', () => {
  test('should be valid when no data set', () => {
    const data = new WorldpayFraudSightData()
    expect(data.shopperId).toBeUndefined()
    expect(data.birthDate).toBeUndefined()
    expect(data.address).toBeUndefined()
    expect(data.validate()).toBeUndefined()
    expect(data.isValid()).toBe(true)

    expect(buildXmlFragment(data)).toEqualXML(
      `<FraudSightData>
         <shopperFields/>
       </FraudSightData>`
    )
  })

  test('should set the birth date correctly', () => {
    const data = new WorldpayFraudSightData().withBirthDate(new Date(1980, 10, 1))
    expect(data.shopperId).toBeUndefined()
    expect(data.birthDate).toBeDefined()
    expect(data.address).toBeUndefined()
    expect(data.validate()).toBeUndefined()
    expect(data.isValid()).toBe(true)

    expect(buildXmlFragment(data)).toEqualXML(
      `<FraudSightData>
         <shopperFields>
            <birthDate>
                <date dayOfMonth="1" month="11" year="1980"/>
            </birthDate>
         </shopperFields>
       </FraudSightData>`
    )
  })

  test('should not be set the birth date correctly', () => {
    const data = new WorldpayFraudSightData().withBirthDate('test')
    expect(data.shopperId).toBeUndefined()
    expect(data.birthDate).toBeDefined()
    expect(data.address).toBeUndefined()
    expect(data.validate()).toEqual(['Birth date must be of type date'])
    expect(data.isValid()).toBe(false)
  })

  test('should set the shopperId correctly', () => {
    const data = new WorldpayFraudSightData().withShopperId(1234)
    expect(data.shopperId).toBeDefined()
    expect(data.birthDate).toBeUndefined()
    expect(data.address).toBeUndefined()
    expect(data.validate()).toBeUndefined()
    expect(data.isValid()).toBe(true)

    expect(buildXmlFragment(data)).toEqualXML(
      `<FraudSightData>
         <shopperFields>
            <shopperId>1234</shopperId>
         </shopperFields>
       </FraudSightData>`
    )
  })

  test('should output the shopperName correctly', () => {
    const data = new WorldpayFraudSightData().withShopperName('Joe Bloggs')
    expect(data.shopperId).toBeUndefined()
    expect(data.shopperName).toBe('Joe Bloggs')
    expect(data.birthDate).toBeUndefined()
    expect(data.address).toBeUndefined()
    expect(data.validate()).toBeUndefined()
    expect(data.isValid()).toBe(true)

    expect(buildXmlFragment(data)).toEqualXML(
      `<FraudSightData>
         <shopperFields>
            <shopperName>Joe Bloggs</shopperName>
         </shopperFields>
       </FraudSightData>`
    )
  })

  test('should output an undefined shopperName when the shopper name passed in is blank', () => {
    const data = new WorldpayFraudSightData().withShopperName('')
    expect(data.shopperId).toBeUndefined()
    expect(data.shopperName).toBeUndefined()
    expect(data.birthDate).toBeUndefined()
    expect(data.address).toBeUndefined()
    expect(data.validate()).toBeUndefined()
    expect(data.isValid()).toBe(true)

    expect(buildXmlFragment(data)).toEqualXML(
      `<FraudSightData>
         <shopperFields/>
       </FraudSightData>`
    )
  })

  test('should throw an exception when a non-array items is passed in to `withCustomStringFields`', () => {
    const data = new WorldpayFraudSightData()
    expect(() => data.withCustomStringFields('not-an-array')).toThrow(
      new Error('`withCustomStringFields` argument must be an array')
    )
  })

  test('should throw an exception when a non-array items is passed in to `withCustomNumericFields`', () => {
    const data = new WorldpayFraudSightData()
    expect(() => data.withCustomNumericFields('not-an-array')).toThrow(
      new Error('`withCustomNumericFields` argument must be an array')
    )
  })

  test('should validate the the custom item arrays are not larger than the allowed maximum', () => {
    const data1 = new WorldpayFraudSightData()
    data1.withCustomNumericFields(new Array(11).fill('test'))
    expect(data1.validate()).toEqual(['Custom numeric fields can have a maximum of 10 items'])

    const data2 = new WorldpayFraudSightData()
    data2.withCustomStringFields(new Array(11).fill('test'))
    expect(data2.validate()).toEqual(['Custom string fields can have a maximum of 10 items'])

    const data3 = new WorldpayFraudSightData()
    data3.withCustomStringFields(new Array(11).fill('test'))
    data3.withCustomNumericFields(new Array(11).fill('test'))
    expect(data3.validate()).toEqual([
      'Custom string fields can have a maximum of 10 items',
      'Custom numeric fields can have a maximum of 10 items',
    ])
  })

  test('should validate the the custom item arrays are not larger than the allowed maximum', () => {
    const data = new WorldpayFraudSightData()
    data.withCustomNumericFields(new Array(11).fill('test'))
    expect(data.validate()).toEqual(['Custom numeric fields can have a maximum of 10 items'])
  })

  test('should output the expected XML when all items are set', () => {
    const address = new WorldpayAddress()
      .withAddress1('Address line 1')
      .withCity('London')
      .withCountryCode('GB')
      .withPostalCode('POST CODE')
    const data = new WorldpayFraudSightData()
      .withShopperId(1234)
      .withShopperName('Fred Smith')
      .withBirthDate(new Date(1980, 10, 1))
      .withShopperAddress(address)
      .withCustomStringFields([
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine',
        'ten',
      ])
      .withCustomNumericFields([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(data.shopperId).toBe(1234)
    expect(data.birthDate).toEqual(new Date(1980, 10, 1))
    expect(data.address).toBe(address)
    expect(data.validate()).toBeUndefined()
    expect(data.isValid()).toBe(true)

    expect(buildXmlFragment(data)).toEqualXML(
      `<FraudSightData>
        <shopperFields>
          <shopperName>Fred Smith</shopperName>
          <shopperId>1234</shopperId>
          <birthDate>
            <date dayOfMonth="1" month="11" year="1980"/>
          </birthDate>
          <shopperAddress>
            <address>
              <address1>Address line 1</address1>
              <postalCode>POST CODE</postalCode>
              <city>London</city>
              <countryCode>GB</countryCode>
            </address>
          </shopperAddress>
          <customStringFields>
            <customStringField1>one</customStringField1>
            <customStringField2>two</customStringField2>
            <customStringField3>three</customStringField3>
            <customStringField4>four</customStringField4>
            <customStringField5>five</customStringField5>
            <customStringField6>six</customStringField6>
            <customStringField7>seven</customStringField7>
            <customStringField8>eight</customStringField8>
            <customStringField9>nine</customStringField9>
            <customStringField10>ten</customStringField10>
          </customStringFields>
          <customNumericFields>
            <customNumericField1>1</customNumericField1>
            <customNumericField2>2</customNumericField2>
            <customNumericField3>3</customNumericField3>
            <customNumericField4>4</customNumericField4>
            <customNumericField5>5</customNumericField5>
            <customNumericField6>6</customNumericField6>
            <customNumericField7>7</customNumericField7>
            <customNumericField8>8</customNumericField8>
            <customNumericField9>9</customNumericField9>
            <customNumericField10>10</customNumericField10>
          </customNumericFields>
        </shopperFields>
      </FraudSightData>`
    )
  })

  test('should not output any XML for custom fields when the arrays are blank', () => {
    const data = new WorldpayFraudSightData().withCustomStringFields([]).withCustomNumericFields([])

    expect(buildXmlFragment(data)).toEqualXML(
      `<FraudSightData>
        <shopperFields/>
      </FraudSightData>`
    )
  })
})
