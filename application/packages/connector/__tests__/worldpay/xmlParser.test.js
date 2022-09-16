'use strict'

const fs = require('fs')
const { parseXml } = require('../../src/worldpay/xmlParser')

const worldpayResponseXml = fs.readFileSync(`${__dirname}/data/paymentResponse1.xml`).toString()

describe('xmlParser', () => {
  test('should parse valid XML', () => {
    const xmlData = parseXml(worldpayResponseXml)
    expect(xmlData).toMatchObject({
      paymentService: {
        '@version': '1.4',
        '@merchantCode': 'ExampleCode1',
        reply: {
          orderStatus: {
            '@orderCode': 'ExampleOrder1',
            reference: {
              '@id': 'YourReference',
              '#': 'https://payments-test.worldpay.com/app/hpp/integration/wpg/corporate?OrderKey=NGPPTESTMERCH1%5Ejsxml3835829684&amp;Ticket=00146321872957902pqKhCTUf0vajKCw-X5HqZA',
            },
          },
        },
      },
    })
  })

  test('should fail with malformed XML', () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
      <!DOCTYPE paymentService PUBLIC "-//WorldPay/DTD WorldPay PaymentService v1//EN" "http://dtd.worldpay.com/paymentService_v1.dtd">
      <paymentService version="1.4" merchantCode="ExampleCode1">`
    expect(() => {
      parseXml(xml)
    }).toThrow(Error)
  })
})
