'use strict'

const Logger = require('../../lib/utils/logger/Logger')

describe('Logger', () => {
  describe('constructor', () => {
    it('should throw an exception is the log level to invalid', () => {
      expect(() => new Logger({ level: 'invalid' })).toThrow(
        new Error('Invalid log level: `invalid`')
      )
    })

    it("should set the log level to 'info'", () => {
      const logger = new Logger()
      expect(logger.level).toBe('info')
    })

    it('should set the log level to the level passed in', () => {
      const logger = new Logger({ level: 'debug' })
      expect(logger.level).toBe('debug')
    })

    it('should set the log level of the underlying Winston logger', () => {
      let logger = new Logger()
      expect(logger.logger.level).toBe('info')

      logger = new Logger({ level: 'debug' })
      expect(logger.logger.level).toBe('debug')
    })

    it('should create methods relating to each of the valid log levels', () => {
      let logger = new Logger()
      expect(logger.error).toBeInstanceOf(Function)
      expect(logger.warn).toBeInstanceOf(Function)
      expect(logger.info).toBeInstanceOf(Function)
      expect(logger.http).toBeInstanceOf(Function)
      expect(logger.verbose).toBeInstanceOf(Function)
      expect(logger.debug).toBeInstanceOf(Function)
      expect(logger.silly).toBeInstanceOf(Function)
    })

    it("should create a property names 'levels' allowing access to all level strings", () => {
      let logger = new Logger()
      expect(logger.levels).toEqual({
        error: 'error',
        warn: 'warn',
        info: 'info',
        http: 'http',
        verbose: 'verbose',
        debug: 'debug',
        silly: 'silly',
      })
    })
  })

  describe('level', () => {
    it('should update the level on both the class and the underlying Winston logger', () => {
      const logger = new Logger()
      const configureSpy = jest.spyOn(logger.logger, 'configure')
      logger.level = 'error'
      expect(logger.level).toBe('error')
      expect(configureSpy).toHaveBeenCalledTimes(1)
    })

    it('should throw an error if an invalid level is used', () => {
      const logger = new Logger()
      expect(() => {
        logger.level = 'invalid'
      }).toThrow(new Error('Invalid log level: `invalid`'))
    })
  })

  describe('silence', () => {
    it("should reconfigure the transports, setting their 'silence' flag to true", () => {
      const logger = new Logger()
      const configureSpy = jest.spyOn(logger.logger, 'configure')
      logger.silence()
      expect(configureSpy).toHaveBeenCalledTimes(1)
      expect(configureSpy.mock.calls.length).toBe(1)
      expect(configureSpy.mock.calls[0].length).toBe(1)
      expect(configureSpy.mock.calls[0][0].transports[0].silent).toBe(true)
    })
  })

  describe('unsilence', () => {
    it("should reconfigure the transports, without any 'silent' flag", () => {
      const logger = new Logger()
      const configureSpy = jest.spyOn(logger.logger, 'configure')
      logger.unsilence()
      expect(configureSpy).toHaveBeenCalledTimes(1)
      expect(configureSpy.mock.calls.length).toBe(1)
      expect(configureSpy.mock.calls[0].length).toBe(1)
      expect(configureSpy.mock.calls[0][0].transports[0].silent).toBeFalsy()
    })
  })
})
