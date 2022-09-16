'use strict'

const WorldpayBase = require('./WorldpayBase')

/**
 * A Worldpay XML FraudSightData entity. Within the element <FraudSightData> you can provide additional data. Use
 * this data to create a more accurate internal review process and logic. This will contribute to the decision of
 * authorising or refusing a payment in real time.
 * https://developer.worldpay.com/docs/wpg/fraudsightglobal/fraudsighthosted/#additional-data
 */
class WorldpayFraudSightData extends WorldpayBase {
  constructor() {
    super(constraints)
  }

  withShopperId(shopperId) {
    this.shopperId = shopperId
    return this
  }

  withShopperName(shopperName) {
    this.shopperName = shopperName
    if (this.shopperName === '') {
      this.shopperName = undefined
    }
    return this
  }

  withBirthDate(birthDate) {
    this.birthDate = birthDate
    return this
  }

  withShopperAddress(address) {
    this.address = address
    return this
  }

  withCustomStringFields(items) {
    if (!Array.isArray(items)) {
      throw new Error('`withCustomStringFields` argument must be an array')
    }
    this.customStringFields = items.length ? items : undefined
    return this
  }

  withCustomNumericFields(items) {
    if (!Array.isArray(items)) {
      throw new Error('`withCustomNumericFields` argument must be an array')
    }
    this.customNumericFields = items.length ? items : undefined
    return this
  }

  buildXmlData() {
    let customStringFields = null
    if (this.customStringFields && this.customStringFields.length) {
      customStringFields = {}
      this.customStringFields.forEach((item, index) => {
        customStringFields[`customStringField${index + 1}`] = item
      })
    }
    let customNumericFields = null
    if (this.customNumericFields && this.customNumericFields.length) {
      customNumericFields = {}
      this.customNumericFields.forEach((item, index) => {
        customNumericFields[`customNumericField${index + 1}`] = item
      })
    }
    return {
      FraudSightData: {
        shopperFields: {
          shopperName: this.shopperName,
          shopperId: this.shopperId,
          birthDate: this.asWorldpayDate(this.birthDate),
          shopperAddress: this.address && this.address.buildXmlData(),
          customStringFields,
          customNumericFields,
        },
      },
    }
  }
}

const constraints = {
  birthDate: {
    type: 'date',
  },
  customStringFields: {
    length: {
      maximum: 10,
      tooLong: 'can have a maximum of %{count} items',
    },
  },
  customNumericFields: {
    length: {
      maximum: 10,
      tooLong: 'can have a maximum of %{count} items',
    },
  },
}

module.exports = WorldpayFraudSightData
