'use strict'

const _ = require('lodash')
const WorldpayBase = require('./WorldpayBase')
const { ADDRESS_LINE_MAX_LENGTH } = require('../constants')

/**
 * A Worldpay XML Address entity used for shipping and billing address details
 * https://developer.worldpay.com/docs/wpg/hostedintegration/paymentrequests#shippingaddress-and-billingaddress
 */
class WorldpayAddress extends WorldpayBase {
  constructor() {
    super(constraints)
  }

  withFirstName(firstName) {
    this.firstName = firstName
    return this
  }

  withLastName(lastName) {
    this.lastName = lastName
    return this
  }

  withAddress1(address1) {
    this.address1 = address1
    return this
  }

  withAddress2(address2) {
    this.address2 = address2
    return this
  }

  withAddress3(address3) {
    this.address3 = address3
    return this
  }

  withPostalCode(postalCode) {
    this.postalCode = postalCode
    return this
  }

  withCity(city) {
    this.city = city
    return this
  }

  withState(state) {
    this.state = state
    return this
  }

  withCountryCode(countryCode) {
    this.countryCode = countryCode
    return this
  }

  withTelephoneNumber(telephoneNumber) {
    this.telephoneNumber = telephoneNumber
    return this
  }

  buildXmlData() {
    const data = {
      address: {
        firstName: this.firstName,
        lastName: this.lastName,
        address1: _.truncate(this.address1, ADDRESS_LINE_MAX_LENGTH),
        address2: this.address2,
        address3: this.address3,
        postalCode: this.postalCode,
        city: this.city,
        state: this.state,
        countryCode: this.countryCode,
        telephoneNumber: this.telephoneNumber,
      },
    }

    return data
  }
}

const constraints = {
  countryCode: {
    presence: true,
  },
}

module.exports = WorldpayAddress
