'use strict'

const WorldpayBase = require('./WorldpayBase')

/**
 * A Worldpay XML OrderLines entity used for detailed order line items
 * https://developer.worldpay.com/docs/wpg/hostedintegration/paymentrequests#shippingaddress-and-billingaddress
 */
class WorldpayLineItem extends WorldpayBase {
  constructor(type = 'physical') {
    super(constraints)
    this.type = type
  }

  withReference(reference) {
    this.reference = reference
    return this
  }

  withName(name) {
    this.name = name
    return this
  }

  withQuantity(quantity) {
    this.quantity = quantity
    return this
  }

  withQuantityUnit(quantityUnit) {
    this.quantityUnit = quantityUnit
    return this
  }

  withUnitPrice(unitPrice) {
    this.unitPrice = unitPrice
    return this
  }

  withTaxRate(taxRate) {
    this.taxRate = taxRate
    return this
  }

  withTotalAmount(totalAmount) {
    this.totalAmount = totalAmount
    return this
  }

  withTotalTaxAmount(totalTaxAmount) {
    this.totalTaxAmount = totalTaxAmount
    return this
  }

  withTotalDiscountAmount(totalDiscountAmount) {
    this.totalDiscountAmount = totalDiscountAmount
    return this
  }

  withProductURL(productURL) {
    this.productURL = productURL
    return this
  }

  withImageURL(imageURL) {
    this.imageURL = imageURL
    return this
  }

  buildXmlData() {
    const data = {
      [this.type]: '',
      reference: this.reference,
      name: this.name,
      quantity: this.quantity,
      quantityUnit: this.quantityUnit,
      unitPrice: this.unitPrice,
      taxRate: this.taxRate,
      totalAmount: this.totalAmount,
      totalTaxAmount: this.totalTaxAmount,
      totalDiscountAmount: this.totalDiscountAmount,
      productURL: this.productURL,
      imageURL: this.imageURL,
    }

    return data
  }
}

const constraints = {
  reference: {
    presence: true,
  },
  name: {
    presence: true,
  },
  quantity: {
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 1,
    },
  },
  quantityUnit: {
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 1,
    },
  },
  unitPrice: {
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
    },
  },
  taxRate: {
    presence: true,
  },
  totalAmount: {
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
    },
  },
  totalTaxAmount: {
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
    },
  },
  totalDiscountAmount: {
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThanOrEqualTo: 0,
    },
  },
  productURL: {},
  imageURL: {},
}

module.exports = WorldpayLineItem
