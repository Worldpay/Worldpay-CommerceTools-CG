'use strict'

const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const WorldpayNotification = require('../../lib/worldpay/WorldpayNotification')
const { WORLDPAY_JOURNAL_TYPES: WJT } = require('../../lib/worldpay/constants')
const { parseXml } = require('../../lib/worldpay/xmlParser')

jest.mock('../../lib/worldpay/xmlParser')

function getTestXml(name) {
  const xmlFilePath = path.join(__dirname, 'data', `${name}.xml`)
  return fs.readFileSync(xmlFilePath, 'utf8')
}

const VALID_XML_OBJECT = require('./data/xmlObjectValid1')

describe('WorldpayNotification', () => {
  let parseXmlSpy
  let extractXmlObjectToPropertiesSpy

  beforeEach(() => {
    parseXmlSpy = jest.spyOn(WorldpayNotification.prototype, 'parseXml')
    extractXmlObjectToPropertiesSpy = jest.spyOn(
      WorldpayNotification.prototype,
      'extractXmlObjectToProperties'
    )
    parseXmlSpy.mockReturnValue('dummyParseXmlResponse')
    extractXmlObjectToPropertiesSpy.mockReturnValue('dummyExtractXmlObjectToProperties')
  })

  afterEach(() => {
    parseXmlSpy.mockRestore()
    extractXmlObjectToPropertiesSpy.mockRestore()
  })

  describe('constructor', () => {
    it('should store the XML string in an instance property', () => {
      const notification = new WorldpayNotification('<xml>test</xml>')
      expect(notification.xmlString).toBe('<xml>test</xml>')
    })

    it('should call the parseXml method and store the output in an instance property', () => {
      parseXmlSpy.mockReturnValue({ dummyObject: true })
      extractXmlObjectToPropertiesSpy.mockReturnValue('')
      const notification = new WorldpayNotification('<xml>test</xml>')
      expect(parseXmlSpy).toHaveBeenCalledTimes(1)
      expect(parseXmlSpy).toHaveBeenCalledWith('<xml>test</xml>')
      expect(notification.xmlObject).toEqual({ dummyObject: true })
    })

    it('should call the extractXmlObjectToProperties method with the output of the parseXml method', () => {
      parseXmlSpy.mockReturnValue({ dummyObject: true })
      extractXmlObjectToPropertiesSpy.mockReturnValue('')
      new WorldpayNotification('<xml>test</xml>')
      expect(extractXmlObjectToPropertiesSpy).toHaveBeenCalledTimes(1)
      expect(extractXmlObjectToPropertiesSpy).toHaveBeenCalledWith({ dummyObject: true })
    })
  })

  describe('determineAmount', () => {
    it('should determine the correct amount for a SENT_FOR_AUTHORISATION notification', () => {
      const notification = new WorldpayNotification(getTestXml('notificationValid1'))
      const amount = notification.determineAmount(
        WJT.SENT_FOR_AUTHORISATION,
        require('./data/xmlObjects/sentForAuthorisation')
      )
      expect(amount).toEqual({
        centAmount: 6800,
        currencyCode: 'EUR',
        fractionDigits: 2,
        type: 'centPrecision',
      })
    })

    it('should determine the correct amount for a AUTHORISED notification', () => {
      const notification = new WorldpayNotification(getTestXml('notificationValid1'))
      const amount = notification.determineAmount(
        WJT.AUTHORISED,
        require('./data/xmlObjects/authorised')
      )
      expect(amount).toEqual({
        centAmount: 7500,
        currencyCode: 'GBP',
        fractionDigits: 2,
        type: 'centPrecision',
      })
    })

    it('should determine the correct amount for a CAPTURED notification', () => {
      const notification = new WorldpayNotification(getTestXml('notificationValid1'))
      const amount = notification.determineAmount(
        WJT.CAPTURED,
        require('./data/xmlObjects/captured')
      )
      expect(amount).toEqual({
        centAmount: 9520,
        currencyCode: 'USD',
        fractionDigits: 2,
        type: 'centPrecision',
      })
    })

    it('should determine the correct amount for a SETTLED notification', () => {
      const notification = new WorldpayNotification(getTestXml('notificationValid1'))
      const amount = notification.determineAmount(WJT.SETTLED, require('./data/xmlObjects/settled'))
      expect(amount).toEqual({
        centAmount: 11743,
        currencyCode: 'GBP',
        fractionDigits: 2,
        type: 'centPrecision',
      })
    })

    it('should determine the correct amount for a REFUNDED notification', () => {
      const notification = new WorldpayNotification(getTestXml('notificationValid1'))
      const amount = notification.determineAmount(
        WJT.REFUNDED,
        require('./data/xmlObjects/refunded')
      )
      expect(amount).toEqual({
        centAmount: 1600,
        currencyCode: 'EUR',
        fractionDigits: 2,
        type: 'centPrecision',
      })
    })

    it('should determine the correct amount for a CANCELLED notification', () => {
      const notification = new WorldpayNotification(getTestXml('notificationValid1'))
      const amount = notification.determineAmount(
        WJT.CANCELLED,
        require('./data/xmlObjects/cancelled')
      )
      expect(amount).toEqual({
        centAmount: 12800,
        currencyCode: 'EUR',
        fractionDigits: 2,
        type: 'centPrecision',
      })
    })

    it('should return null when the amountTx property is missing', () => {
      const notification = new WorldpayNotification(getTestXml('notificationValid1'))
      const amount = notification.determineAmount(
        WJT.AUTHORISED,
        require('./data/xmlObjects/authorisedEmptyAccountTx')
      )
      expect(amount).toBeNull()
    })
  })

  describe('parseXml', () => {
    let notification

    beforeEach(() => {
      notification = new WorldpayNotification(getTestXml('notificationValid1'))
    })

    it('should call the parseXml function from the xmlParse module', () => {
      parseXmlSpy.mockRestore()
      notification.parseXml('<xml>test</xml>')
      expect(parseXml).toHaveBeenCalledTimes(1)
      expect(parseXml).toHaveBeenCalledWith('<xml>test</xml>')

      parseXml.mockReset()

      notification.parseXml('<xml>test2</xml>')
      expect(parseXml).toHaveBeenCalledTimes(1)
      expect(parseXml).toHaveBeenCalledWith('<xml>test2</xml>')
    })
  })

  describe('extractXmlObjectToProperties', () => {
    let notification

    beforeEach(() => {
      notification = new WorldpayNotification(getTestXml('notificationValid1'))
      extractXmlObjectToPropertiesSpy.mockRestore()
    })

    it('should not throw an error when the notification is valid', () => {
      expect(() => {
        notification.extractXmlObjectToProperties(VALID_XML_OBJECT)
      }).not.toThrow()
    })

    it('should throw an error when the notification is missing the `paymentService` element', () => {
      const invalidObject = _.cloneDeep(VALID_XML_OBJECT)
      delete invalidObject.paymentService
      expect(() => {
        notification.extractXmlObjectToProperties(invalidObject)
      }).toThrow(new Error('Worldpay response XML missing expected paymentService node'))
    })

    it('should throw an error when the notification is missing the XML object is falsy', () => {
      expect(() => {
        notification.extractXmlObjectToProperties(null)
      }).toThrow(new Error('Worldpay response XML missing expected paymentService node'))
    })

    it('should throw an error when the notification is missing the `notify` element', () => {
      const invalidObject = _.cloneDeep(VALID_XML_OBJECT)
      delete invalidObject.paymentService.notify
      expect(() => {
        notification.extractXmlObjectToProperties(invalidObject)
      }).toThrow(new Error('Worldpay response XML missing expected paymentService.notify node'))
    })

    it('should throw an error when the notification is missing the `orderStatusEvent` element', () => {
      expect(() => {
        const invalidObject = _.cloneDeep(VALID_XML_OBJECT)
        delete invalidObject.paymentService.notify.orderStatusEvent
        notification.extractXmlObjectToProperties(invalidObject)
      }).toThrow(
        new Error(
          'Worldpay response XML missing expected paymentService.notify.orderStatusEvent node'
        )
      )
    })

    it('should return a null value for `amount` if `determineAmount` throws an exception', () => {
      notification.determineAmount = jest.fn()
      notification.determineAmount.mockImplementation(() => {
        throw new Error('dummy error')
      })
      notification.extractXmlObjectToProperties(VALID_XML_OBJECT)
      expect(notification.amount).toBeNull()
    })

    it('should extract XML object properties to instance properties', () => {
      notification.extractXmlObjectToProperties(VALID_XML_OBJECT)
      expect(notification.merchantCode).toBe(VALID_XML_OBJECT.paymentService['@merchantCode'])
      expect(notification.orderCode).toBe(
        VALID_XML_OBJECT.paymentService.notify.orderStatusEvent['@orderCode']
      )
      expect(notification.worldpayDtdVersion).toBe(VALID_XML_OBJECT.paymentService['@version'])
    })
  })
})
