'use strict'

const _ = require('lodash')
const ConfigLoader = require('../../lib/config/Loader')
const log = require('../../lib/utils/log')

describe('ConfigLoader', () => {
  const VALID_SYSTEM_VARS = {
    WORLDPAY_EXTENSION_LOG_LEVEL: 'error',
    WORLDPAY_EXTENSION_BOOTSTRAP_RESOURCES: 'true',
  }

  const VALID_SERVER_VARS = {
    WORLDPAY_EXTENSION_PORT: '1234',
    WORLDPAY_EXTENSION_ENDPOINT: 'https://dummyendpoint.com/extension',
    WORLDPAY_EXTENSION_BEARER_TOKEN: 'myBearerToken',
    WORLDPAY_EXTENSION_AUTH_REALM: 'myAuthRealm',
  }
  const VALID_WP_ENV_VARS = {
    WORLDPAY_MERCHANT_CODE: 'dummymerchantcode',
    WORLDPAY_INSTALLATION_ID: 'dummyinstallationid',
    WORLDPAY_XML_USERNAME: 'dummyxmlusername',
    WORLDPAY_XML_PASSWORD: 'dummyxmlpassword',
    WORLDPAY_MAC_SECRET: 'dummymacsecret',
    WORLDPAY_REQUEST_TIMEOUT: 1500,
    WORLDPAY_ENV: 'test',
    WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT: 'true',
  }

  const VALID_CT_ENV_VARS = {
    CTP_PROJECT_KEY: 'dummyprojectkey',
    CTP_CLIENT_ID: 'dummyclientid',
    CTP_CLIENT_SECRET: 'dummyclientsecret',
    CTP_API_URL: 'http://dummyapiurl.com',
    CTP_AUTH_URL: 'http://dummyauthurl.com',
  }

  const VALID_ENV_VARS = _.merge(
    {},
    VALID_SYSTEM_VARS,
    VALID_SERVER_VARS,
    VALID_WP_ENV_VARS,
    VALID_CT_ENV_VARS
  )

  const baseExpectedConfig = {
    system: {
      debug: false,
      logLevel: 'error',
      bootstrapResources: true,
    },
    server: {
      port: 1234,
      endpoint: 'https://dummyendpoint.com/extension',
      bearerToken: 'myBearerToken',
      authRealm: 'myAuthRealm',
    },
    commercetools: {
      projectKey: 'dummyprojectkey',
      clientId: 'dummyclientid',
      clientSecret: 'dummyclientsecret',
      apiUrl: 'http://dummyapiurl.com',
      authUrl: 'http://dummyauthurl.com',
    },
    worldpay: {
      installationId: 'dummyinstallationid',
      macSecret: 'dummymacsecret',
      merchantCode: 'dummymerchantcode',
      xmlPassword: 'dummyxmlpassword',
      xmlUsername: 'dummyxmlusername',
      timeout: 1500,
      env: 'test',
      includeFraudSight: true,
    },
  }

  describe('load', () => {
    it('should return the expected values', () => {
      const configLoader = new ConfigLoader()
      const result = configLoader.load(VALID_ENV_VARS)
      expect(result).toEqual(baseExpectedConfig)
    })

    it('should set debug to true when NODE_ENV is set to development', () => {
      const configLoader = new ConfigLoader()
      const result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          NODE_ENV: 'development',
        })
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          system: {
            debug: true,
          },
        })
      )
    })

    it('should use the defined PORT and LOG_LEVEL env vars', () => {
      const configLoader = new ConfigLoader()
      const result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_EXTENSION_PORT: '9999',
          WORLDPAY_EXTENSION_LOG_LEVEL: 'debug',
        })
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          system: {
            logLevel: 'debug',
          },
          server: {
            port: 9999,
          },
        })
      )
    })

    it('should use the default PORT and LOG_LEVEL if none defined', () => {
      const envVars = _.assign({}, VALID_ENV_VARS)
      delete envVars.WORLDPAY_EXTENSION_LOG_LEVEL
      delete envVars.WORLDPAY_EXTENSION_PORT
      const configLoader = new ConfigLoader()
      const result = configLoader.load(envVars)
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          system: {
            logLevel: log.defaultLevel,
          },
          server: {
            port: 3000,
          },
        })
      )
    })

    it('should use the default auth realm if none defined', () => {
      const envVars = _.assign({}, VALID_ENV_VARS)
      delete envVars.WORLDPAY_EXTENSION_AUTH_REALM
      const configLoader = new ConfigLoader()
      const result = configLoader.load(envVars)
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          server: {
            authRealm: 'Worldpay commercetools extension',
          },
        })
      )
    })

    it('should use environment variables from process.env if none passed in', () => {
      const temp = process.env
      process.env = VALID_ENV_VARS
      const configLoader = new ConfigLoader()
      const result = configLoader.load()
      expect(result).toEqual(baseExpectedConfig)
      process.env = temp
    })

    it('should convert WORLDPAY_EXTENSION_BOOTSTRAP_RESOURCES to a boolean if true or false', () => {
      const configLoader = new ConfigLoader()
      let result

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_EXTENSION_BOOTSTRAP_RESOURCES: 'true',
        })
      )

      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          system: {
            bootstrapResources: true,
          },
        })
      )

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_EXTENSION_BOOTSTRAP_RESOURCES: 'false',
        })
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          system: {
            bootstrapResources: false,
          },
        })
      )
    })

    it('should default WORLDPAY_EXTENSION_BOOTSTRAP_RESOURCES to false if not a known value', () => {
      const configLoader = new ConfigLoader()
      let result

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_EXTENSION_BOOTSTRAP_RESOURCES: 'test',
        })
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          system: {
            bootstrapResources: false,
          },
        })
      )
    })

    it('should not alter WORLDPAY_EXTENSION_BOOTSTRAP_RESOURCES when the value is `force`', () => {
      const configLoader = new ConfigLoader()
      let result

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_EXTENSION_BOOTSTRAP_RESOURCES: 'force',
        })
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          system: {
            bootstrapResources: 'force',
          },
        })
      )
    })

    it('should set `worldpay.includeFraudSight` correctly', () => {
      const configLoader = new ConfigLoader()
      let result

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT: 'true',
        })
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          worldpay: {
            includeFraudSight: true,
          },
        })
      )

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT: 'false',
        })
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          worldpay: {
            includeFraudSight: false,
          },
        })
      )

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT: 'invalid',
        })
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          worldpay: {
            includeFraudSight: false,
          },
        })
      )
    })

    it('should call the `validate` method', () => {
      const configLoader = new ConfigLoader()
      configLoader.validate = jest.fn()
      configLoader.load(VALID_ENV_VARS)
      expect(configLoader.validate.mock.calls.length).toBe(1)
    })
  })

  describe('validate', () => {
    it('should throw and exception if the `config` parameter is missing', () => {
      const configLoader = new ConfigLoader()
      expect(() => configLoader.validate()).toThrow()
    })

    it('should throw and exception if the `config` parameter is empty', () => {
      const configLoader = new ConfigLoader()
      expect(() => configLoader.validate({})).toThrow()
    })

    it('should call both validateCommercetoolsConfig and validateWorldpayConfig', () => {
      const configLoader = new ConfigLoader()
      configLoader.validateExtensionConfig = jest.fn()
      configLoader.validateCommercetoolsConfig = jest.fn()
      configLoader.validateWorldpayConfig = jest.fn()
      configLoader.load(VALID_ENV_VARS)
      expect(configLoader.validateExtensionConfig.mock.calls.length).toBe(1)
      expect(configLoader.validateCommercetoolsConfig.mock.calls.length).toBe(1)
      expect(configLoader.validateWorldpayConfig.mock.calls.length).toBe(1)
    })
  })

  describe('validateExtensionConfig', () => {
    it('should throw an exception if the server port is NaN', () => {
      const configLoader = new ConfigLoader()
      const config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_EXTENSION_PORT: 'abc' })
      expect(() => configLoader.validateExtensionConfig(config)).toThrow(Error)
    })

    it('should throw an exception if the server bearerToken is missing', () => {
      const configLoader = new ConfigLoader()
      const config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_EXTENSION_BEARER_TOKEN: '' })
      expect(() => configLoader.validateExtensionConfig(config)).toThrow(Error)
      delete config.WORLDPAY_EXTENSION_BEARER_TOKEN
      expect(() => configLoader.validateExtensionConfig(config)).toThrow(Error)
    })

    it('should throw an exception if the log level is invalid', () => {
      const configLoader = new ConfigLoader()
      const config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_EXTENSION_LOG_LEVEL: 'test' })
      expect(() => configLoader.validateExtensionConfig(config)).toThrow(Error)
    })

    it('should throw an exception if the endpoint is blank', () => {
      const configLoader = new ConfigLoader()
      const config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_EXTENSION_ENDPOINT: '' })
      expect(() => configLoader.validateExtensionConfig(config)).toThrow(Error)
    })

    it('should throw an exception if the endpoint is missing', () => {
      const configLoader = new ConfigLoader()
      const config = _.assign({}, VALID_ENV_VARS)
      delete config.WORLDPAY_EXTENSION_ENDPOINT
      expect(() => configLoader.validateExtensionConfig(config)).toThrow(Error)
    })

    it('should throw an exception if the endpoint is invalid', () => {
      const configLoader = new ConfigLoader()
      const config = _.assign({}, VALID_ENV_VARS, { WORLDPAY_EXTENSION_ENDPOINT: 'invalidurl' })
      expect(() => configLoader.validateExtensionConfig(config)).toThrowError(
        'WORLDPAY_EXTENSION_ENDPOINT [invalidurl] is invalid'
      )
    })

    it('should throw an exception if the endpoint is not https', () => {
      const configLoader = new ConfigLoader()
      const config = _.assign({}, VALID_ENV_VARS, {
        WORLDPAY_EXTENSION_ENDPOINT: 'http://test.com',
      })
      expect(() => configLoader.validateExtensionConfig(config)).toThrowError(
        'WORLDPAY_EXTENSION_ENDPOINT must be `https`'
      )
    })

    it('should throw an exception if the auth realm is not in the correct format', () => {
      const configLoader = new ConfigLoader()
      let config = _.assign({}, VALID_ENV_VARS, {
        WORLDPAY_EXTENSION_AUTH_REALM: 'Test with "quotation" marks',
      })
      expect(() => configLoader.validateExtensionConfig(config)).toThrowError(
        'WORLDPAY_EXTENSION_AUTH_REALM must only contain alphanumerics and spaces'
      )

      config = _.assign({}, VALID_ENV_VARS, {
        WORLDPAY_EXTENSION_AUTH_REALM: '   ',
      })
      expect(() => configLoader.validateExtensionConfig(config)).toThrowError(
        'WORLDPAY_EXTENSION_AUTH_REALM must only contain alphanumerics and spaces'
      )

      config = _.assign({}, VALID_ENV_VARS, {
        WORLDPAY_EXTENSION_AUTH_REALM: ' Starts with a space',
      })
      expect(() => configLoader.validateExtensionConfig(config)).toThrowError(
        'WORLDPAY_EXTENSION_AUTH_REALM must only contain alphanumerics and spaces'
      )
    })

    it('should not throw an exception if all values are valid', () => {
      const configLoader = new ConfigLoader()
      const config = _.merge({}, VALID_ENV_VARS)
      expect(() => configLoader.validateExtensionConfig(config)).not.toThrow(Error)
    })
  })

  describe('validateCommercetoolsConfig', () => {
    it('should throw an exception if any Commerce Tools env vars are missing', () => {
      const configLoader = new ConfigLoader()
      let config

      config = _.merge({}, VALID_ENV_VARS)
      delete config.CTP_PROJECT_KEY
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.CTP_CLIENT_ID
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.CTP_CLIENT_SECRET
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.CTP_API_URL
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.CTP_AUTH_URL
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)
    })

    it('should throw an exception if any Commerce Tools env vars are blank', () => {
      const configLoader = new ConfigLoader()
      let config

      config = _.merge({}, VALID_ENV_VARS, { CTP_PROJECT_KEY: '' })
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { CTP_CLIENT_ID: '' })
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { CTP_CLIENT_SECRET: '' })
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { CTP_API_URL: '' })
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { CTP_AUTH_URL: '' })
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)
    })

    it('should not throw an exception if all Commerce Tools values are valid', () => {
      const configLoader = new ConfigLoader()
      let config = _.merge({}, VALID_ENV_VARS)
      expect(() => configLoader.validateCommercetoolsConfig(config)).not.toThrow(Error)
    })
  })

  describe('validateWorldpayConfig', () => {
    it('should throw an exception if any Worldpay env vars are missing', () => {
      const configLoader = new ConfigLoader()
      let config

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_MERCHANT_CODE
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_INSTALLATION_ID
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_XML_USERNAME
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_XML_PASSWORD
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_MAC_SECRET
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_ENV
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)
    })

    it('should throw an exception if any Worldpay env vars are blank', () => {
      const configLoader = new ConfigLoader()
      let config

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_INSTALLATION_ID: '' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_MERCHANT_CODE: '' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_XML_USERNAME: '' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_XML_PASSWORD: '' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_MAC_SECRET: '' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT: '' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)
    })

    it('should throw an exception if WORLDPAY_ENV is invalid', () => {
      const configLoader = new ConfigLoader()
      let config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_ENV: 'invalid' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)
    })

    it('should not throw an exception if WORLDPAY_ENV is set to `production`', () => {
      const configLoader = new ConfigLoader()
      let config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_ENV: 'production' })
      expect(() => configLoader.validateWorldpayConfig(config)).not.toThrow(Error)
    })

    it('should not throw an exception if all values are valid', () => {
      const configLoader = new ConfigLoader()
      let config = _.merge({}, VALID_ENV_VARS)
      expect(() => configLoader.validateWorldpayConfig(config)).not.toThrow(Error)
    })
  })
})
