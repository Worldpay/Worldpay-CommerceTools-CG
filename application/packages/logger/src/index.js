'use strict'

const context = require('@gradientedge/wcc-context')
const { Logger, LOG_LEVEL } = require('./logger')

const systemLogger = new Logger({
  systemLevel: true,
})

module.exports = new Proxy(systemLogger, {
  get(target, property, receiver) {
    try {
      const requestContext = context.retrieve()
      target = requestContext.logger
      // eslint-disable-next-line no-empty
    } catch (e) {}
    return Reflect.get(target, property, receiver)
  },
})

module.exports.Logger = Logger
module.exports.LOG_LEVEL = LOG_LEVEL
