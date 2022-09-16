'use strict'

const stringify = require('json-stringify-safe')
const util = require('util')
const _ = require('lodash')

const VALID_LEVEL_NAMES = ['debug', 'info', 'warn', 'error']

const LOG_LEVEL = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  DEFAULT: 'debug',
}

const LOG_LEVEL_DEBUG = 10
const LOG_LEVEL_INFO = 20
const LOG_LEVEL_WARN = 40
const LOG_LEVEL_ERROR = 50

const LOG_LEVEL_NUMBER = {
  [LOG_LEVEL.DEBUG]: 10,
  [LOG_LEVEL.INFO]: 20,
  [LOG_LEVEL.WARN]: 40,
  [LOG_LEVEL.ERROR]: 50,
}

class Logger {
  constructor(options) {
    this.baseData = options?.baseData || {}
    this.pretty = options?.pretty ?? process?.env.NODE_ENV === 'development'
    this.levelName = VALID_LEVEL_NAMES.includes(options?.level) ? options?.level : LOG_LEVEL.DEFAULT
    this.levelNumber = LOG_LEVEL_NUMBER[this.levelName]
    this.systemLevel = !!options?.systemLevel

    if (options?.systemLogger) {
      this.systemLogger = {
        debug:
          options.systemLogger.debug ??
          options.systemLogger.verbose ??
          (() => console.error('`systemLogger` does not have a `debug` or `verbose` method')),
        info: options.systemLogger.info ?? (() => console.error('`systemLogger` does not have an `info` method')),
        warn: options.systemLogger.warn ?? (() => console.error('`systemLogger` does not have a `warn` method')),
        error: options.systemLogger.error ?? (() => console.error('`systemLogger` does not have an `error` method')),
      }
    } else {
      this.systemLogger = console
    }
  }

  debug(...args) {
    this.process(this.systemLogger.debug, LOG_LEVEL_DEBUG, 'debug', args)
  }

  info(...args) {
    this.process(this.systemLogger.info, LOG_LEVEL_INFO, 'info', args)
  }

  warn(...args) {
    this.process(this.systemLogger.warn, LOG_LEVEL_WARN, 'warn', args)
  }

  error(...args) {
    this.process(this.systemLogger.error, LOG_LEVEL_ERROR, 'error', args)
  }

  text(input) {
    this.systemLogger.debug(input)
  }

  setBaseData(data, merge = true) {
    if (this.systemLevel) {
      this.warn('Ignoring call to `setBaseData` on system level log object', new Error().stack)
    } else {
      const clonedData = _.cloneDeep(data)
      if (!merge) {
        this.baseData = clonedData
      } else {
        _.merge(this.baseData, clonedData)
      }
    }
  }

  process(method, levelInt, level, args) {
    if (levelInt < this.levelNumber) {
      return
    }
    if (!Array.isArray(args) || args.length === 0) {
      return
    }
    let logData = { ...this.baseData, logLevel: level }
    if (typeof args[0] === 'string') {
      logData.message = args[0]
      logData.data = args.slice(1)
    } else {
      logData.data = args
    }
    if (Array.isArray(logData.data)) {
      logData.data.forEach((item) => {
        if (item?.error instanceof Error) {
          item.error = transformError(item.error)
        }
      })
      if (logData.data.length === 1) {
        logData.data = logData.data[0]
      }
    }
    if (this.pretty) {
      method(
        util.inspect(logData, {
          showHidden: false,
          depth: null,
          colors: true,
          compact: false,
          maxStringLength: null,
          maxArrayLength: null,
        }),
      )
    } else {
      method(stringify(logData))
    }
  }
}

/**
 * Transform an Error object in to something more digestible.
 * We do some specific transformation of Axios errors. Additionally,
 * the use of `serializeError` ensures that all fields in the error
 * object are revealed in the logs.
 */
function transformError(error, recursionLevel = 0) {
  if (recursionLevel > 5) {
    return
  }
  let simpleError = {}
  Object.getOwnPropertyNames(error).forEach(function (key) {
    simpleError[key] = error[key]
  })
  if (error?.isAxiosError) {
    simpleError = pickAxiosErrorFields(simpleError)
  }
  if (error?.data?.error?.isAxiosError) {
    simpleError.data.error = pickAxiosErrorFields(simpleError)
  }
  return simpleError
}

/**
 * Return only the fields we really want to see from the Axios error object.
 * If we don't do this, then we get many thousands of lines of log lines as
 * the HttpsAgent is a huge deeply nested object.
 */
function pickAxiosErrorFields(error) {
  return {
    ..._.pick(error, ['message', 'name', 'code', 'stack']),
    config: _.pick(error?.config, ['url', 'method', 'headers', 'timeout', 'params']),
  }
}

module.exports = {
  Logger,
  LOG_LEVEL,
}
