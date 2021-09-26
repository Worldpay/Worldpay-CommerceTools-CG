'use strict'

const winston = require('winston')
const formats = require('./formats')
const DEFAULT_LEVEL = 'info'
const VALID_LEVELS = ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']

class Logger {
  /**
   * Create a new logger
   *
   * This logger implementation utilises Winston under the hood:
   * {@see https://github.com/winstonjs/winston}
   *
   * @param {object} options Valid Winston options
   */
  constructor(options = {}) {
    this.defaultLevel = DEFAULT_LEVEL
    if (options.level && !VALID_LEVELS.includes(options.level)) {
      throw new Error(`Invalid log level: \`${options.level}\``)
    }
    this._level = options.level || this.defaultLevel
    this.options = {
      level: this._level,
      format: winston.format.combine(...formats),
      transports: [new winston.transports.Console()],
      ...options,
    }
    this.levels = VALID_LEVELS.reduce((acc, curr) => {
      acc[curr] = curr
      return acc
    }, {})
    VALID_LEVELS.forEach((level) => {
      this[level] = (...args) => this.log(level, args)
    })
    this.logger = winston.createLogger(this.options)
  }

  /**
   * Send the log request through to the appropriate Winston instance function

   * @param level
   * @param args
   * @returns {*}
   */
  log(level, args) {
    return this.logger[level](...args)
  }

  /**
   * Set a new level
   *
   * We set the new level by reconfiguring the Winston logger instance
   *
   * @param {string} newLevel The new level
   */
  set level(newLevel) {
    if (!VALID_LEVELS.includes(newLevel)) {
      throw new Error(`Invalid log level: \`${newLevel}\``)
    }
    this._level = newLevel
    this.logger.configure(this.options)
  }

  /**
   * Get the current level
   *
   * @returns {string} The current level
   */
  get level() {
    return this._level
  }

  /**
   * Silence the logger
   */
  silence() {
    this.logger.configure({
      ...this.options,
      transports: this.options.transports.map((transport) => {
        transport.silent = true
        return transport
      }),
    })
  }

  /**
   * Unsilence the logger
   */
  unsilence() {
    this.logger.configure(this.options)
  }
}

module.exports = Logger
