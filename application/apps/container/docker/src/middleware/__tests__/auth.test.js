'use strict'

const { ResponseCodes, Headers } = require('http-headers-js')
const auth = require('../auth')

describe('auth', () => {
  let req
  let res
  let getMock
  let setMock
  let statusMock
  let sendMock
  let nextMock

  beforeEach(() => {
    getMock = jest.fn(() => 'Bearer testToken')
    req = {
      get: getMock,
    }
    sendMock = jest.fn()
    nextMock = jest.fn()
    statusMock = jest.fn(() => ({
      send: sendMock,
    }))
    setMock = jest.fn(() => ({
      status: statusMock,
    }))
    res = {
      set: setMock,
    }
  })

  it('should return a function', () => {
    expect(auth()).toBeInstanceOf(Function)
  })

  describe('returned function', () => {
    let middleware

    beforeEach(() => {
      middleware = auth('testToken', 'test realm')
    })

    it('should call `next` without altering the response when the bearer token is correct', () => {
      middleware(req, res, nextMock)
      expect(nextMock.mock.calls.length).toBe(1)
      expect(statusMock.mock.calls.length).toBe(0)
      expect(sendMock.mock.calls.length).toBe(0)
    })

    it('should not call `next` and return a 401 status when the bearer token is incorrect', () => {
      getMock.mockReturnValue('invalidToken')
      middleware(req, res, nextMock)
      expect(nextMock.mock.calls.length).toBe(0)
      expect(setMock.mock.calls.length).toBe(1)
      expect(setMock.mock.calls[0].length).toBe(2)
      expect(setMock.mock.calls[0][0]).toBe(Headers.WWW_AUTHENTICATE)
      expect(setMock.mock.calls[0][1]).toBe(
        'Bearer realm="test realm", error="invalid_token", error_description="Incorrect bearer token provided"',
      )
      expect(statusMock.mock.calls.length).toBe(1)
      expect(statusMock.mock.calls[0].length).toBe(1)
      expect(statusMock.mock.calls[0][0]).toBe(ResponseCodes.UNAUTHORIZED)
      expect(sendMock.mock.calls.length).toBe(1)
      expect(sendMock.mock.calls[0].length).toBe(0)
    })

    it('should not call `next` and return a 401 status when the bearer token is null', () => {
      getMock.mockReturnValue(null)
      middleware(req, res, nextMock)
      expect(nextMock.mock.calls.length).toBe(0)
      expect(setMock.mock.calls.length).toBe(1)
      expect(setMock.mock.calls[0].length).toBe(2)
      expect(setMock.mock.calls[0][0]).toBe(Headers.WWW_AUTHENTICATE)
      expect(setMock.mock.calls[0][1]).toBe('Bearer realm="test realm"')
      expect(statusMock.mock.calls.length).toBe(1)
      expect(statusMock.mock.calls[0].length).toBe(1)
      expect(statusMock.mock.calls[0][0]).toBe(ResponseCodes.UNAUTHORIZED)
      expect(sendMock.mock.calls.length).toBe(1)
      expect(sendMock.mock.calls[0].length).toBe(0)
    })

    it('should not call `next` and return a 401 status when the bearer token is undefined', () => {
      getMock.mockReturnValue(undefined)
      middleware(req, res, nextMock)
      expect(nextMock.mock.calls.length).toBe(0)
      expect(setMock.mock.calls.length).toBe(1)
      expect(setMock.mock.calls[0].length).toBe(2)
      expect(setMock.mock.calls[0][0]).toBe(Headers.WWW_AUTHENTICATE)
      expect(setMock.mock.calls[0][1]).toBe('Bearer realm="test realm"')
      expect(statusMock.mock.calls.length).toBe(1)
      expect(statusMock.mock.calls[0].length).toBe(1)
      expect(statusMock.mock.calls[0][0]).toBe(ResponseCodes.UNAUTHORIZED)
      expect(sendMock.mock.calls.length).toBe(1)
      expect(sendMock.mock.calls[0].length).toBe(0)
    })
  })
})
