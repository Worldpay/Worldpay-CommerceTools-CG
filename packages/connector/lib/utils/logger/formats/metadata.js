'use strict'

const _ = require('lodash')
const winston = require('winston')
const { LEVEL, MESSAGE } = require('triple-beam')

const responseFormat = winston.format((info) => {
  const metadata = _.omit(info, ['level', 'message', LEVEL, MESSAGE])
  const metadataKeys = Object.keys(metadata)
  metadataKeys.forEach((key) => {
    delete info[key]
  })
  if (info.hasOwnProperty('metadata')) {
    delete info.metadata
  }
  if (metadataKeys.length) {
    info.metadata = metadata
  }
  return info
})

module.exports = responseFormat()
