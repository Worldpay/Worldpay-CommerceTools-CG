'use strict'

const PaymentProcessor = require('../lib/processor/payment/PaymentProcessor')
const NotificationProcessor = require('../lib/processor/notification/NotificationProcessor')
const CommercetoolsClient = require('../lib/commercetools/Client')
const HttpServer = require('../lib/httpserver')
const packageJson = require('../package.json')
const createServer = require('../createServer')

jest.mock('../lib/processor/payment/PaymentProcessor')
jest.mock('../lib/processor/notification/NotificationProcessor')
jest.mock('../lib/commercetools/Client')
jest.mock('../lib/httpserver')

const testConfig = {
  system: {
    debug: true,
    logLevel: 'debug',
    bootstrapResources: false,
  },
  server: {
    port: 3000,
    endpoint: 'http://wpextension.com/payment',
    bearerToken: 'testToken',
    authRealm: 'MyAuthRealm',
  },
  commercetools: {
    projectKey: 'testProjectKey',
    clientId: 'testClientId',
    clientSecret: 'testClientSecret',
    apiUrl: 'http://apiurl.com',
    authUrl: 'http://authurl.com',
  },
  worldpay: {
    merchantCode: 'testMerchantCode',
    installationId: 'testInstallationId',
    xmlUsername: 'testXmlUsername',
    xmlPassword: 'testXmlPassword',
    macSecret: 'testMacSecret',
    timeout: 999,
    env: 'dev',
  },
}

describe('createServer', () => {
  let server

  it('should create an instances of the expected classes', () => {
    server = createServer(testConfig)
    expect(CommercetoolsClient).toHaveBeenCalledWith(testConfig.commercetools)
    expect(PaymentProcessor).toHaveBeenCalledWith(
      expect.any(CommercetoolsClient),
      testConfig.worldpay,
      {
        key: testConfig.commercetools.projectKey,
        version: packageJson.version,
      }
    )
    expect(NotificationProcessor).toHaveBeenCalledWith(
      expect.any(CommercetoolsClient),
      testConfig.worldpay
    )
    expect(HttpServer).toHaveBeenCalledWith(
      {
        payment: expect.any(PaymentProcessor),
        notification: expect.any(NotificationProcessor),
      },
      testConfig.server
    )
    expect(server).toBeInstanceOf(HttpServer)
  })

  it('should return the pre-initiated instance if for any subsequent calls', () => {
    const server2 = createServer(testConfig)
    expect(server2).toBe(server)
  })
})
