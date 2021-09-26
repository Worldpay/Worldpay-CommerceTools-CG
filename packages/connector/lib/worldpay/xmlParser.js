'use strict'

const parser = require('fast-xml-parser')
const { convert } = require('xmlbuilder2')

// Object conversion (serialization) settings
// https://oozcitak.github.io/xmlbuilder2/serialization.html#serialization-settings
const serializationSettings = {
  format: 'object',
  wellFormed: true,
  group: false,
  verbose: false,
  noDoubleEncoding: true,
}

function parseXml(xml) {
  const validationResult = parser.validate(xml)
  if (validationResult !== true) {
    throw new Error(
      `Failed to parse XML - ${validationResult.err.msg} - at line ${validationResult.err.line}`
    )
  }
  const obj = convert(xml, serializationSettings)
  return obj
}

module.exports = { parseXml }
