'use strict'

const _ = require('lodash')
const winston = require('winston')

const responseFormat = winston.format((info) => {
  if (info.hasOwnProperty('req')) {
    info.req = _.pick(info.req, [
      'httpVersion',
      'headers',
      'url',
      'method',
      'statusCode',
      'body',
      'baseUrl',
    ])
  }

  if (info.hasOwnProperty('res')) {
    info.res = _.pick(info.res, [
      'httpVersion',
      'headers',
      'url',
      'method',
      'statusCode',
      'body',
      'baseUrl',
    ])
  }
  return info
})

module.exports = responseFormat()
