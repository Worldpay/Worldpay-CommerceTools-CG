'use strict'

const { fragment, create } = require('xmlbuilder2')
const constants = require('./constants')
const _ = require('lodash')

// XML Serialization settings
// https://oozcitak.github.io/xmlbuilder2/serialization.html#serialization-settings
const serializationSettings = {
  format: 'xml',
  wellFormed: true,
  prettyPrint: true,
}

function WorldpayValidationException(errors) {
  this.errors = errors
}

WorldpayValidationException.prototype.toString = function () {
  const msg = _.flattenDeep(Object.values(this.errors)).join(', ')
  return msg
}

function buildXmlFragment(item, validate = true) {
  if (!item.buildXmlData || !item.isValid) {
    throw new Error(`item ${item} must have a buildXmlData and isValid method`)
  }
  if (validate && !item.isValid()) {
    throw new WorldpayValidationException(item.validate())
  }
  const xmlString = fragment().ele(item.buildXmlData()).end(serializationSettings)
  return xmlString
}

function buildWorldpayXml(item, validate = true) {
  if (!item.buildXmlData || !item.isValid) {
    throw new Error(`item ${item} must have a buildXmlData and isValid method`)
  }
  if (validate && !item.isValid()) {
    throw new WorldpayValidationException(item.validate())
  }

  // Generate XML constructs with requisite DTD
  const xml = create({ encoding: 'UTF-8' })
    .dtd({
      pubID: constants.WORLDPAY_DTD_PUB,
      sysID: constants.WORLDPAY_DTD_SYS,
    })
    .ele(item.buildXmlData())
    .doc()

  // Generate properly formatted XML string
  const xmlString = xml.end(serializationSettings)
  return xmlString
}

module.exports = { buildXmlFragment, buildWorldpayXml, WorldpayValidationException }
