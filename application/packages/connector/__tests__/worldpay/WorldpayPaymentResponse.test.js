'use strict'

const fs = require('fs')
const WorldpayPaymentResponse = require('../../src/worldpay/WorldpayPaymentResponse')

const worldpayResponseXml = fs.readFileSync(`${__dirname}/data/paymentResponse1.xml`).toString()

describe('WorldpayPaymentResponse', () => {
  test('should parse valid HPP payment response XML', () => {
    const response = new WorldpayPaymentResponse().fromXmlData(worldpayResponseXml)
    expect(response.isValid()).toBe(true)
    expect(response.validate()).toBeUndefined()
    expect(response.merchantCode).toEqual('ExampleCode1')
    expect(response.worldpayDtdVersion).toEqual('1.4')
    expect(response.orderCode).toEqual('ExampleOrder1')
    expect(response.referenceId).toEqual('YourReference')
    expect(response.referenceValue).toEqual(
      'https://payments-test.worldpay.com/app/hpp/integration/wpg/corporate?OrderKey=NGPPTESTMERCH1%5Ejsxml3835829684&Ticket=00146321872957902pqKhCTUf0vajKCw-X5HqZA',
    )
  })

  test('should be invalid with missing merchantCode', () => {
    let response = new WorldpayPaymentResponse().fromXmlData(worldpayResponseXml)
    response.merchantCode = undefined
    expect(response.isValid()).toBe(false)
    expect(response.validate()).toEqual(expect.arrayContaining(["MerchantCode can't be blank"]))
  })

  test('should be invalid with missing orderCode', () => {
    let response = new WorldpayPaymentResponse().fromXmlData(worldpayResponseXml)
    response.orderCode = undefined
    expect(response.isValid()).toBe(false)
    expect(response.validate()).toEqual(expect.arrayContaining(["OrderCode can't be blank"]))
  })

  test('should be invalid with missing referenceId', () => {
    let response = new WorldpayPaymentResponse().fromXmlData(worldpayResponseXml)
    response.referenceId = undefined
    expect(response.isValid()).toBe(false)
    expect(response.validate()).toEqual(expect.arrayContaining(["ReferenceId can't be blank"]))
  })

  test('should be invalid with missing referenceValue', () => {
    let response = new WorldpayPaymentResponse().fromXmlData(worldpayResponseXml)
    response.referenceValue = undefined
    expect(response.isValid()).toBe(false)
    expect(response.validate()).toEqual(expect.arrayContaining(["ReferenceValue can't be blank"]))
  })

  test('should be invalid with referenceValue that is not a URL', () => {
    let response = new WorldpayPaymentResponse().fromXmlData(worldpayResponseXml)
    response.referenceValue = 'ABC123'
    expect(response.isValid()).toBe(false)
    expect(response.validate()).toEqual(expect.arrayContaining(['ReferenceValue is not a valid url']))
  })

  test('should only require referenceId when reference node is present', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE paymentService PUBLIC "-//WorldPay/DTD WorldPay PaymentService v1//EN" "http://dtd.worldpay.com/paymentService_v1.dtd">
      <paymentService version="1.4" merchantCode="ExampleCode1">
        <!--The merchantCode you supplied in the order-->
        <reply>
          <orderStatus orderCode="ExampleOrder1">
            <otherNode/>
          </orderStatus>
        </reply>
      </paymentService>`
    let response = new WorldpayPaymentResponse().fromXmlData(xml)
    expect(response.isValid()).toBe(true)
    expect(response.validate()).toBeUndefined()
  })

  test('should fail to parse invalid XML', () => {
    expect(() => {
      new WorldpayPaymentResponse().fromXmlData()
    }).toThrow(Error)

    expect(() => {
      new WorldpayPaymentResponse().fromXmlData('NOT_XML')
    }).toThrow(Error)
  })

  test('should fail with missing paymentService node', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <foo version="1.4" merchantCode="ExampleCode1">
        <bar/>
      </foo>`
    expect(() => {
      new WorldpayPaymentResponse().fromXmlData(xml)
    }).toThrow(Error)
  })

  test('should fail with missing paymentService.reply node', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE paymentService PUBLIC "-//WorldPay/DTD WorldPay PaymentService v1//EN" "http://dtd.worldpay.com/paymentService_v1.dtd">
      <paymentService version="1.4" merchantCode="ExampleCode1">
        <foo/>
      </paymentService>`
    expect(() => {
      new WorldpayPaymentResponse().fromXmlData(xml)
    }).toThrow(Error)
  })

  test('should fail with missing paymentService.reply.orderStatus node', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE paymentService PUBLIC "-//WorldPay/DTD WorldPay PaymentService v1//EN" "http://dtd.worldpay.com/paymentService_v1.dtd">
      <paymentService version="1.4" merchantCode="ExampleCode1">
        <!--The merchantCode you supplied in the order-->
        <reply>
          <foo/>
        </reply>
      </paymentService>`
    expect(() => {
      new WorldpayPaymentResponse().fromXmlData(xml)
    }).toThrow(Error)
  })

  test('should fail with malformed XML', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE paymentService PUBLIC "-//WorldPay/DTD WorldPay PaymentService v1//EN" "http://dtd.worldpay.com/paymentService_v1.dtd">
      <paymentService version="1.4" merchantCode="ExampleCode1">`
    expect(() => {
      new WorldpayPaymentResponse().fromXmlData(xml)
    }).toThrow(Error)
  })
})
