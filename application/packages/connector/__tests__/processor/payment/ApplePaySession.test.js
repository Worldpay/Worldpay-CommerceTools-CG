'use strict'

const createApplePaySession = require('../../../src/processor/payment/ApplePaySession')
const fs = require('fs')
const axios = require('axios')
const path = require('path')

describe('ApplePaySession', () => {
  const VALID_APPLE_PAY_ENV_VARS = {
    WORLDPAY_CONNECTOR_MERCHANT_NAME: 'Sunrise Worldpay Shop',
    WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_DOMAIN: 'www.myshop.com',
    WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_ID: 'merchant.com.worldpay',
  }

  let resolveSpy
  let accessSyncSpy
  let readFileSyncSpy
  beforeEach(() => {
    accessSyncSpy = jest.spyOn(fs, 'accessSync').mockReturnValue(true)
    resolveSpy = jest.spyOn(path, 'resolve').mockReturnValue('/fakepath')
  })

  afterEach(() => {
    resolveSpy.mockRestore()
    accessSyncSpy.mockRestore()
    readFileSyncSpy.mockRestore()
  })

  it('should return a valid session upon successful connect', async () => {
    const temp = process.env
    axios.post = jest.fn(() => ({ status: 200, data: { session: 'hello' } }))
    process.env = VALID_APPLE_PAY_ENV_VARS

    const input = 'https://apple-pay-gateway.apple.com/session'
    readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('')
    const result = await createApplePaySession(input)

    process.env = temp
    expect(result).toEqual({ status: 200, data: { session: 'hello' } })
  })

  it('should throw an error on bad request', async () => {
    const temp = process.env
    axios.post = jest.fn(() => ({ status: 400, data: 'error' }))
    process.env = VALID_APPLE_PAY_ENV_VARS

    try {
      const input = 'https://apple-pay-gateway.apple.com/session'
      readFileSyncSpy = jest.spyOn(fs, 'readFileSync').mockReturnValue('')
      const result = await createApplePaySession(input)

      expect(result).fail('Should have failed')
    } catch (error) {
      expect(error).toEqual({
        errors: [{ code: 'InvalidOperation', message: '`Failed to set up Apple Pay session`' }],
      })
    }
    process.env = temp
  })

  it('should throw an error with bad certificates', async () => {
    const temp = process.env
    axios.post = jest.fn(() => {
      throw new Error()
    })
    process.env = VALID_APPLE_PAY_ENV_VARS

    try {
      const input = 'apple-pay-gateway.apple.com/session'
      const result = await createApplePaySession(input)
      expect(result).fail('Should have failed')
    } catch (error) {
      expect(error).toEqual({
        errors: [{ code: 'InvalidOperation', message: '`Failed to set up Apple Pay session`' }],
      })
    }
    process.env = temp
  })

  it('should not accept untrusted URLs', async () => {
    const temp = process.env
    axios.post = jest.fn(() => {
      throw new Error()
    })
    process.env = VALID_APPLE_PAY_ENV_VARS

    try {
      const input = 'https://www.evilhacker.com/session'
      const result = await createApplePaySession(input)
      expect(result).fail('Should have failed')
    } catch (error) {
      expect(error).toEqual({
        errors: [{ code: 'InvalidOperation', message: '`Failed to set up Apple Pay session`' }],
      })
    }
    process.env = temp
  })
})
