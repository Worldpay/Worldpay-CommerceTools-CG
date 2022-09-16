'use strict'

const _ = require('lodash')
const ConfigLoader = require('../../src/config/Loader')
const { LOG_LEVEL } = require('@gradientedge/wcc-logger')

describe('ConfigLoader', () => {
  const VALID_SYSTEM_VARS = {
    WORLDPAY_CONNECTOR_LOG_LEVEL: 'error',
  }

  const VALID_WP_ENV_VARS = {
    WORLDPAY_CONNECTOR_MERCHANT_CODE: 'dummymerchantcode',
    WORLDPAY_CONNECTOR_INSTALLATION_ID: 'dummyinstallationid',
    WORLDPAY_CONNECTOR_XML_USERNAME: 'dummyxmlusername',
    WORLDPAY_CONNECTOR_XML_PASSWORD: 'dummyxmlpassword',
    WORLDPAY_CONNECTOR_MAC_SECRET: 'dummymacsecret',
    WORLDPAY_CONNECTOR_REQUEST_TIMEOUT: 1500,
    WORLDPAY_CONNECTOR_ENV: 'test',
    WORLDPAY_CONNECTOR_INCLUDE_FRAUDSIGHT: 'true',
    WORLDPAY_CONNECTOR_ENABLE_TOKENISATION: 'false',
    WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_ID: 'apple.pay.merchant.id',
    WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_DOMAIN: 'my.apple.pay.merchant.domain',
    WORLDPAY_CONNECTOR_MERCHANT_NAME: 'My merchant name, visible to users',
    WORLDPAY_CONNECTOR_ENABLE_EXEMPTION_ENGINE: 'true',
    WORLDPAY_CONNECTOR_EXEMPTION_TYPE: 'OP',
    WORLDPAY_CONNECTOR_EXEMPTION_PLACEMENT: 'OPTIMISED',
    WORLDPAY_CONNECTOR_SPACES_IN_PAYPAL_DESCRIPTION: 'false',
    WORLDPAY_CONNECTOR_MAP_STATE_TO_ISO_3611_2: 'true',
  }

  const VALID_CT_ENV_VARS = {
    WORLDPAY_CONNECTOR_CTP_PROJECT_KEY: 'dummyprojectkey',
    WORLDPAY_CONNECTOR_CTP_CLIENT_ID: 'dummyclientid',
    WORLDPAY_CONNECTOR_CTP_CLIENT_SECRET: 'dummyclientsecret',
    WORLDPAY_CONNECTOR_CTP_API_URL: 'http://dummyapiurl.com',
    WORLDPAY_CONNECTOR_CTP_AUTH_URL: 'http://dummyauthurl.com',
    WORLDPAY_CONNECTOR_TERMS_URL: 'https://www.myshop.com/terms-and-conditions',
    WORLDPAY_CONNECTOR_RETURN_URL: 'https://www.myshop.com/checkout',
  }

  const VALID_ENV_VARS = _.merge({}, VALID_SYSTEM_VARS, VALID_WP_ENV_VARS, VALID_CT_ENV_VARS)

  const baseExpectedConfig = {
    system: {
      logLevel: 'error',
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
      exemptionEnabled: true,
      exemptionType: 'OP',
      exemptionPlacement: 'OPTIMISED',
      enableTokenisation: false,
      termsURL: 'https://www.myshop.com/terms-and-conditions',
      returnURL: 'https://www.myshop.com/checkout',
      spacesInPaypalDescription: false,
      mapStateToISOCode: true,
    },
  }

  describe('load', () => {
    it('should return the expected values', () => {
      const configLoader = new ConfigLoader()
      const result = configLoader.load(VALID_ENV_VARS)
      expect(result).toEqual(baseExpectedConfig)
    })

    it('should use the defined PORT and LOG_LEVEL env vars', () => {
      const configLoader = new ConfigLoader()
      const result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_CONNECTOR_LOG_LEVEL: 'debug',
        }),
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          system: {
            logLevel: 'debug',
          },
        }),
      )
    })

    it('should use the default LOG_LEVEL if none defined', () => {
      const envVars = _.assign({}, VALID_ENV_VARS)
      delete envVars.WORLDPAY_CONNECTOR_LOG_LEVEL
      const configLoader = new ConfigLoader()
      const result = configLoader.load(envVars)
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          system: {
            logLevel: LOG_LEVEL.DEFAULT,
          },
        }),
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

    it('should set `worldpay.includeFraudSight` correctly', () => {
      const configLoader = new ConfigLoader()
      let result

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_CONNECTOR_INCLUDE_FRAUDSIGHT: 'true',
        }),
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          worldpay: {
            includeFraudSight: true,
          },
        }),
      )

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_CONNECTOR_INCLUDE_FRAUDSIGHT: 'false',
        }),
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          worldpay: {
            includeFraudSight: false,
          },
        }),
      )

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_CONNECTOR_INCLUDE_FRAUDSIGHT: 'invalid',
        }),
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          worldpay: {
            includeFraudSight: false,
          },
        }),
      )
    })

    it('should set `worldpay.enableTokenisation` correctly', () => {
      const configLoader = new ConfigLoader()
      let result

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_CONNECTOR_ENABLE_TOKENISATION: 'true',
        }),
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          worldpay: {
            enableTokenisation: true,
          },
        }),
      )

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_CONNECTOR_ENABLE_TOKENISATION: 'false',
        }),
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          worldpay: {
            enableTokenisation: false,
          },
        }),
      )

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_CONNECTOR_ENABLE_TOKENISATION: 'invalid',
        }),
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          worldpay: {
            enableTokenisation: false,
          },
        }),
      )
    })

    it('should call the `validate` method', () => {
      const configLoader = new ConfigLoader()
      configLoader.validate = jest.fn()
      configLoader.load(VALID_ENV_VARS)
      expect(configLoader.validate.mock.calls.length).toBe(1)
    })

    it('should set `worldpay.captureDelay` correctly if set', () => {
      const configLoader = new ConfigLoader()
      let result

      result = configLoader.load(
        _.assign({}, VALID_ENV_VARS, {
          WORLDPAY_CONNECTOR_CAPTURE_DELAY: 0,
        }),
      )
      expect(result).toEqual(
        _.merge({}, baseExpectedConfig, {
          worldpay: {
            captureDelay: 0,
          },
        }),
      )
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
    it('should throw an exception if the log level is invalid', () => {
      const configLoader = new ConfigLoader()
      const config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_LOG_LEVEL: 'test' })
      expect(() => configLoader.validateExtensionConfig(config)).toThrow(Error)
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
      delete config.WORLDPAY_CONNECTOR_CTP_PROJECT_KEY
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_CTP_CLIENT_ID
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_CTP_CLIENT_SECRET
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_CTP_API_URL
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_CTP_AUTH_URL
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)
    })

    it('should throw an exception if any Commerce Tools env vars are blank', () => {
      const configLoader = new ConfigLoader()
      let config

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_CTP_PROJECT_KEY: '' })
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_CTP_CLIENT_ID: '' })
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_CTP_CLIENT_SECRET: '' })
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_CTP_API_URL: '' })
      expect(() => configLoader.validateCommercetoolsConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_CTP_AUTH_URL: '' })
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
      delete config.WORLDPAY_CONNECTOR_MERCHANT_CODE
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_INSTALLATION_ID
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_XML_USERNAME
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_XML_PASSWORD
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_MAC_SECRET
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_ENV
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_INCLUDE_FRAUDSIGHT
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_ENABLE_EXEMPTION_ENGINE
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_EXEMPTION_TYPE
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS)
      delete config.WORLDPAY_CONNECTOR_EXEMPTION_PLACEMENT
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)
    })

    it('should throw an exception if any Worldpay env vars are blank', () => {
      const configLoader = new ConfigLoader()
      let config

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_INSTALLATION_ID: '' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_MERCHANT_CODE: '' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_XML_USERNAME: '' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_XML_PASSWORD: '' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_MAC_SECRET: '' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)

      config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_INCLUDE_FRAUDSIGHT: '' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)
    })

    it('should throw an exception if WORLDPAY_CONNECTOR_ENV is invalid', () => {
      const configLoader = new ConfigLoader()
      let config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_ENV: 'invalid' })
      expect(() => configLoader.validateWorldpayConfig(config)).toThrow(Error)
    })

    it('should not throw an exception if WORLDPAY_CONNECTOR_ENV is set to `production`', () => {
      const configLoader = new ConfigLoader()
      let config = _.merge({}, VALID_ENV_VARS, { WORLDPAY_CONNECTOR_ENV: 'production' })
      expect(() => configLoader.validateWorldpayConfig(config)).not.toThrow(Error)
    })

    it('should not throw an exception if all values are valid', () => {
      const configLoader = new ConfigLoader()
      let config = _.merge({}, VALID_ENV_VARS)
      expect(() => configLoader.validateWorldpayConfig(config)).not.toThrow(Error)
    })
  })
})
