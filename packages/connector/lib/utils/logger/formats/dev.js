'use strict'

const stringify = require('json-stringify-safe')
const { format } = require('winston')
const request = require('./request')
const { colorize, timestamp, errors, printf, splat } = format

const devFormat = [
  format((info) => {
    info.level = info.level.toUpperCase()
    return info
  })(),
  colorize(),
  timestamp(),
  splat(),
  errors(),
  request,
  printf(({ level, message, ...rest }) => {
    let restString = stringify(rest, undefined, 2)
    restString = restString === '{}' ? '' : restString

    return `${level} - ${message} ${restString}`
  }),
]

module.exports = devFormat
