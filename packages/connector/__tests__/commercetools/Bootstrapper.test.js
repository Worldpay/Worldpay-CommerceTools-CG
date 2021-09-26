'use strict'

const path = require('path')
const _ = require('lodash')

const CommercetoolsBootstrapper = require('../../lib/commercetools/Bootstrapper')

const templateExtension = {
  key: 'worldpay-payment-api-extension',
  destination: {
    type: 'HTTP',
    url: '',
    authentication: {
      type: 'AuthorizationHeader',
      headerValue: '',
    },
  },
  triggers: [
    {
      resourceTypeId: 'payment',
      actions: ['Create', 'Update'],
    },
  ],
  timeoutInMs: 2000,
}

const templateExistingExtension = {
  id: 'ee7b9a58-7c94-4cad-9d9c-8ebf6819e2fb',
  version: 1,
  destination: { type: 'HTTP', url: 'http://www.gradientedge.com' },
  key: 'worldpay-payment-api-extension',
  timeoutInMs: 2000,
}

describe('CommercetoolsBootstrapper', () => {
  describe('constructor', () => {
    it('should throw an exception when no `client` parameter is passed in', () => {
      expect(
        () =>
          new CommercetoolsBootstrapper(null, {
            bearerToken: 'myBearerToken',
            extensionEndpoint: 'http://dummyendpoint.com',
            resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
          })
      ).toThrowError('`client` parameter is missing')
    })

    it('should throw an exception when no `extensionEndpoint` parameter is passed in', () => {
      expect(
        () =>
          new CommercetoolsBootstrapper(
            {},
            {
              bearerToken: 'myBearerToken',
              resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
            }
          )
      ).toThrowError('`options.extensionEndpoint` parameter is missing')
    })

    it('should throw an exception when no `bearerToken` parameter is passed in', () => {
      expect(
        () =>
          new CommercetoolsBootstrapper(
            {},
            {
              extensionEndpoint: 'http://dummyendpoint.com',
              resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
            }
          )
      ).toThrowError('`options.bearerToken` parameter is missing')
    })

    it('should throw an exception when no `resourcesPath` parameter is passed in', () => {
      expect(
        () =>
          new CommercetoolsBootstrapper(
            {},
            {
              bearerToken: 'myBearerToken',
              extensionEndpoint: 'http://dummyendpoint.com',
            }
          )
      ).toThrowError('`options.resourcesPath` is empty or does not exist')
    })

    it('should throw an exception when `resourcesPath` does not exist', () => {
      expect(
        () =>
          new CommercetoolsBootstrapper(
            {},
            {
              bearerToken: 'myBearerToken',
              resourcesPath: '/does/not/exist',
              extensionEndpoint: 'http://dummyendpoint.com',
            }
          )
      ).toThrowError('`options.resourcesPath` is empty or does not exist')
    })

    it('should default `forceRecreate` to false', () => {
      const bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )

      expect(bootstrapper.forceRecreate).toBe(false)
    })

    it('should set `forceRecreate` property to false when `forceRecreate` option is false', () => {
      const bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: false,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )

      expect(bootstrapper.forceRecreate).toBe(false)
    })

    it('should set `forceRecreate` property to true when `forceRecreate` option is true', () => {
      const bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )

      expect(bootstrapper.forceRecreate).toBe(true)
    })
  })

  describe('execute', () => {
    it('should call `processApiExtensions` and `processTypes` methods', async () => {
      const bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )

      bootstrapper.processApiExtensions = jest.fn()
      bootstrapper.processTypes = jest.fn()

      await bootstrapper.execute()

      expect(bootstrapper.processApiExtensions.mock.calls.length).toBe(1)
      expect(bootstrapper.processApiExtensions.mock.calls[0].length).toBe(0)
      expect(bootstrapper.processTypes.mock.calls.length).toBe(1)
      expect(bootstrapper.processTypes.mock.calls[0].length).toBe(0)
    })
  })

  describe('processApiExtensions', () => {
    let bootstrapper

    beforeEach(() => {
      bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )
      bootstrapper.processTypes = jest.fn()
    })

    it('should call `loadApiExtensionsData` to retrieve a list of extensions to process', async () => {
      bootstrapper.loadApiExtensionsData = jest.fn(() => [])
      await bootstrapper.execute()

      expect(bootstrapper.loadApiExtensionsData.mock.calls.length).toBe(1)
      expect(bootstrapper.loadApiExtensionsData.mock.calls[0].length).toBe(0)
    })

    it('should not call any other methods if `loadApiExtensionsData` returns an empty array', async () => {
      bootstrapper.getExistingApiExtension = jest.fn()
      bootstrapper.createApiExtension = jest.fn()
      bootstrapper.deleteApiExtension = jest.fn()
      bootstrapper.loadApiExtensionsData = jest.fn(() => [])
      await bootstrapper.execute()

      expect(bootstrapper.loadApiExtensionsData.mock.calls.length).toBe(1)
      expect(bootstrapper.loadApiExtensionsData.mock.calls[0].length).toBe(0)
      expect(bootstrapper.getExistingApiExtension.mock.calls.length).toBe(0)
      expect(bootstrapper.createApiExtension.mock.calls.length).toBe(0)
      expect(bootstrapper.deleteApiExtension.mock.calls.length).toBe(0)
    })

    it('should call `getExistingApiExtension` once when data for one extension is loaded', async () => {
      bootstrapper.getExistingApiExtension = jest.fn(() => templateExistingExtension)
      bootstrapper.loadApiExtensionsData = jest.fn(() => [templateExtension])
      bootstrapper.createApiExtension = jest.fn(() => null)
      bootstrapper.deleteApiExtension = jest.fn()
      await bootstrapper.execute()

      expect(bootstrapper.loadApiExtensionsData.mock.calls.length).toBe(1)
      expect(bootstrapper.loadApiExtensionsData.mock.calls[0].length).toBe(0)
      expect(bootstrapper.getExistingApiExtension.mock.calls.length).toBe(1)
      expect(bootstrapper.getExistingApiExtension.mock.calls[0].length).toBe(1)
      expect(bootstrapper.getExistingApiExtension.mock.calls[0][0]).toEqual(templateExtension)
    })

    it('should not call `createApiExtension` if `getExistingApiExtension` returns data and `forceRecreate` is false', async () => {
      bootstrapper.forceRecreate = false
      bootstrapper.getExistingApiExtension = jest.fn(() => templateExistingExtension)
      bootstrapper.createApiExtension = jest.fn()
      bootstrapper.loadApiExtensionsData = jest.fn(() => [templateExtension])
      await bootstrapper.execute()

      expect(bootstrapper.createApiExtension.mock.calls.length).toBe(0)
    })

    it('should call `createApiExtension` if `getExistingApiExtension` returns null and `forceRecreate` is false', async () => {
      bootstrapper.forceRecreate = false
      bootstrapper.getExistingApiExtension = jest.fn(() => null)
      bootstrapper.createApiExtension = jest.fn(() => null)
      bootstrapper.loadApiExtensionsData = jest.fn(() => [templateExtension])
      await bootstrapper.execute()

      expect(bootstrapper.createApiExtension.mock.calls.length).toBe(1)
      expect(bootstrapper.createApiExtension.mock.calls[0].length).toBe(1)
      expect(bootstrapper.createApiExtension.mock.calls[0][0]).toEqual(templateExtension)
    })

    it('should call `createApiExtension` if `getExistingApiExtension` returns null and `forceRecreate` is true', async () => {
      bootstrapper.getExistingApiExtension = jest.fn(() => null)
      bootstrapper.createApiExtension = jest.fn(() => null)
      bootstrapper.deleteApiExtension = jest.fn()
      bootstrapper.loadApiExtensionsData = jest.fn(() => [templateExtension])
      await bootstrapper.execute()

      expect(bootstrapper.createApiExtension.mock.calls.length).toBe(1)
      expect(bootstrapper.createApiExtension.mock.calls[0].length).toBe(1)
      expect(bootstrapper.createApiExtension.mock.calls[0][0]).toEqual(templateExtension)
      expect(bootstrapper.deleteApiExtension.mock.calls.length).toBe(0)
    })

    it('should call `deleteApiExtension` and `createApiExtension` if `getExistingApiExtension` returns data and `forceRecreate` is true', async () => {
      bootstrapper.getExistingApiExtension = jest.fn(() => templateExistingExtension)
      bootstrapper.createApiExtension = jest.fn(() => templateExtension)
      bootstrapper.deleteApiExtension = jest.fn()
      bootstrapper.loadApiExtensionsData = jest.fn(() => [templateExtension])
      await bootstrapper.execute()

      expect(bootstrapper.createApiExtension.mock.calls.length).toBe(1)
      expect(bootstrapper.createApiExtension.mock.calls[0].length).toBe(1)
      expect(bootstrapper.createApiExtension.mock.calls[0][0]).toEqual(templateExtension)
      expect(bootstrapper.deleteApiExtension.mock.calls.length).toBe(1)
      expect(bootstrapper.deleteApiExtension.mock.calls[0].length).toBe(2)
      expect(bootstrapper.deleteApiExtension.mock.calls[0][0]).toEqual(
        templateExistingExtension.key
      )
      expect(bootstrapper.deleteApiExtension.mock.calls[0][1]).toBe(
        templateExistingExtension.version
      )
    })
  })

  describe('loadApiExtensionsData', () => {
    let bootstrapper

    beforeEach(() => {
      bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )
      bootstrapper.processTypes = jest.fn()
    })

    it('should call `readJSONFile` with the correct path', () => {
      bootstrapper.readJSONFile = jest.fn()
      bootstrapper.loadApiExtensionsData()
      expect(bootstrapper.readJSONFile.mock.calls.length).toBe(1)
      expect(bootstrapper.readJSONFile.mock.calls[0].length).toBe(1)
      expect(bootstrapper.readJSONFile.mock.calls[0][0]).toBe(
        path.resolve(
          __dirname,
          './data/bootstrap1/api-extension/worldpay-payment-api-extension.json'
        )
      )
    })
  })

  describe('createApiExtension', () => {
    let bootstrapper

    beforeEach(() => {
      bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )
      bootstrapper.processTypes = jest.fn()
    })

    it('should call `createApiExtension` on the underlying Commercetools client with the correct definition', () => {
      bootstrapper.client.createApiExtension = jest.fn(() => templateExistingExtension)
      bootstrapper.createApiExtension(templateExtension)
      expect(bootstrapper.client.createApiExtension.mock.calls.length).toBe(1)
      expect(bootstrapper.client.createApiExtension.mock.calls[0].length).toBe(1)
      expect(bootstrapper.client.createApiExtension.mock.calls[0][0]).toEqual(
        _.merge({}, templateExtension, {
          destination: {
            url: 'http://dummyendpoint.com',
            authentication: {
              type: 'AuthorizationHeader',
              headerValue: 'Bearer myBearerToken',
            },
          },
        })
      )
    })

    it('should return the data returned from `createApiExtension` on the underlying Commercetools client', () => {
      let response
      bootstrapper.client.createApiExtension = jest.fn(() => templateExistingExtension)
      response = bootstrapper.createApiExtension(templateExtension)
      expect(response).toEqual(templateExistingExtension)
    })
  })

  describe('deleteApiExtension', () => {
    let bootstrapper

    beforeEach(() => {
      bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )
      bootstrapper.processTypes = jest.fn()
    })

    it('should call `deleteApiExtensionByKey` on the underlying Commercetools client with the correct params', () => {
      bootstrapper.client.deleteApiExtensionByKey = jest.fn(() => templateExistingExtension)
      bootstrapper.deleteApiExtension(
        templateExistingExtension.key,
        templateExistingExtension.version
      )
      expect(bootstrapper.client.deleteApiExtensionByKey.mock.calls.length).toBe(1)
      expect(bootstrapper.client.deleteApiExtensionByKey.mock.calls[0].length).toBe(2)
      expect(bootstrapper.client.deleteApiExtensionByKey.mock.calls[0][0]).toBe(
        templateExistingExtension.key
      )
      expect(bootstrapper.client.deleteApiExtensionByKey.mock.calls[0][1]).toBe(
        templateExistingExtension.version
      )
    })

    it('should return the data returned from `deleteApiExtensionByKey` on the underlying Commercetools client', () => {
      let response
      bootstrapper.client.deleteApiExtensionByKey = jest.fn(() => templateExistingExtension)
      response = bootstrapper.deleteApiExtension(templateExtension)
      expect(response).toEqual(templateExistingExtension)
    })
  })

  describe('getExistingApiExtension', () => {
    let bootstrapper

    beforeEach(() => {
      bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )
      bootstrapper.processTypes = jest.fn()
    })

    it('should call `getApiExtensionByKey` on the underlying Commercetools client with the correct params', async () => {
      bootstrapper.client.getApiExtensionByKey = jest.fn(() => templateExistingExtension)
      await bootstrapper.getExistingApiExtension(templateExtension)
      expect(bootstrapper.client.getApiExtensionByKey.mock.calls.length).toBe(1)
      expect(bootstrapper.client.getApiExtensionByKey.mock.calls[0].length).toBe(1)
      expect(bootstrapper.client.getApiExtensionByKey.mock.calls[0][0]).toBe(
        templateExistingExtension.key
      )
    })

    it('should return the data returned from `getApiExtensionByKey` on the underlying Commercetools client', async () => {
      let response
      bootstrapper.client.getApiExtensionByKey = jest.fn(() => templateExistingExtension)
      response = await bootstrapper.getExistingApiExtension(templateExtension)
      expect(response).toEqual(templateExistingExtension)
    })
  })

  describe('processTypes', () => {
    let bootstrapper

    beforeEach(() => {
      bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )
      bootstrapper.processApiExtensions = jest.fn()
    })

    it('should call `loadTypesData` to retrieve a list of types to process', async () => {
      bootstrapper.loadTypesData = jest.fn(() => [])
      await bootstrapper.execute()

      expect(bootstrapper.loadTypesData.mock.calls.length).toBe(1)
      expect(bootstrapper.loadTypesData.mock.calls[0].length).toBe(0)
    })

    it('should not call any other methods if `loadTypesData` returns an empty array', async () => {
      bootstrapper.getExistingType = jest.fn()
      bootstrapper.createType = jest.fn()
      bootstrapper.deleteType = jest.fn()
      bootstrapper.loadTypesData = jest.fn(() => [])
      await bootstrapper.execute()

      expect(bootstrapper.loadTypesData.mock.calls.length).toBe(1)
      expect(bootstrapper.loadTypesData.mock.calls[0].length).toBe(0)
      expect(bootstrapper.getExistingType.mock.calls.length).toBe(0)
      expect(bootstrapper.createType.mock.calls.length).toBe(0)
      expect(bootstrapper.deleteType.mock.calls.length).toBe(0)
    })

    it('should call `getExistingType` once when data for one type is loaded', async () => {
      bootstrapper.getExistingType = jest.fn(() => templateExistingExtension)
      bootstrapper.loadTypesData = jest.fn(() => [templateExtension])
      bootstrapper.createType = jest.fn(() => null)
      bootstrapper.deleteType = jest.fn()
      await bootstrapper.execute()

      expect(bootstrapper.loadTypesData.mock.calls.length).toBe(1)
      expect(bootstrapper.loadTypesData.mock.calls[0].length).toBe(0)
      expect(bootstrapper.getExistingType.mock.calls.length).toBe(1)
      expect(bootstrapper.getExistingType.mock.calls[0].length).toBe(1)
      expect(bootstrapper.getExistingType.mock.calls[0][0]).toEqual(templateExtension)
    })

    it('should not call `createType` if `getExistingType` returns data and `forceRecreate` is false', async () => {
      bootstrapper.forceRecreate = false
      bootstrapper.getExistingType = jest.fn(() => templateExistingExtension)
      bootstrapper.createType = jest.fn()
      bootstrapper.loadTypesData = jest.fn(() => [templateExtension])
      await bootstrapper.execute()

      expect(bootstrapper.createType.mock.calls.length).toBe(0)
    })

    it('should call `createType` if `getExistingType` returns null and `forceRecreate` is false', async () => {
      bootstrapper.forceRecreate = false
      bootstrapper.getExistingType = jest.fn(() => null)
      bootstrapper.createType = jest.fn(() => null)
      bootstrapper.loadTypesData = jest.fn(() => [templateExtension])
      await bootstrapper.execute()

      expect(bootstrapper.createType.mock.calls.length).toBe(1)
      expect(bootstrapper.createType.mock.calls[0].length).toBe(1)
      expect(bootstrapper.createType.mock.calls[0][0]).toEqual(templateExtension)
    })

    it('should call `createType` if `getExistingType` returns null and `forceRecreate` is true', async () => {
      bootstrapper.getExistingType = jest.fn(() => null)
      bootstrapper.createType = jest.fn(() => null)
      bootstrapper.deleteType = jest.fn()
      bootstrapper.loadTypesData = jest.fn(() => [templateExtension])
      await bootstrapper.execute()

      expect(bootstrapper.createType.mock.calls.length).toBe(1)
      expect(bootstrapper.createType.mock.calls[0].length).toBe(1)
      expect(bootstrapper.createType.mock.calls[0][0]).toEqual(templateExtension)
      expect(bootstrapper.deleteType.mock.calls.length).toBe(0)
    })

    it('should call `deleteType` and `createType` if `getExistingType` returns data and `forceRecreate` is true', async () => {
      bootstrapper.getExistingType = jest.fn(() => templateExistingExtension)
      bootstrapper.createType = jest.fn(() => templateExtension)
      bootstrapper.deleteType = jest.fn()
      bootstrapper.loadTypesData = jest.fn(() => [templateExtension])
      await bootstrapper.execute()

      expect(bootstrapper.createType.mock.calls.length).toBe(1)
      expect(bootstrapper.createType.mock.calls[0].length).toBe(1)
      expect(bootstrapper.createType.mock.calls[0][0]).toEqual(templateExtension)
      expect(bootstrapper.deleteType.mock.calls.length).toBe(1)
      expect(bootstrapper.deleteType.mock.calls[0].length).toBe(2)
      expect(bootstrapper.deleteType.mock.calls[0][0]).toEqual(templateExistingExtension.key)
      expect(bootstrapper.deleteType.mock.calls[0][1]).toBe(templateExistingExtension.version)
    })
  })

  describe('loadTypesData', () => {
    let bootstrapper

    beforeEach(() => {
      bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )
      bootstrapper.processTypes = jest.fn()
    })

    it('should call `readJSONFile` with the correct path', () => {
      bootstrapper.readJSONFile = jest.fn()
      bootstrapper.loadTypesData()
      expect(bootstrapper.readJSONFile.mock.calls.length).toBe(3)
      expect(bootstrapper.readJSONFile.mock.calls[0].length).toBe(1)
      expect(bootstrapper.readJSONFile.mock.calls[0][0]).toBe(
        path.resolve(
          __dirname,
          './data/bootstrap1/types/worldpay-payment-interface-interaction.json'
        )
      )
      expect(bootstrapper.readJSONFile.mock.calls[1].length).toBe(1)
      expect(bootstrapper.readJSONFile.mock.calls[1][0]).toBe(
        path.resolve(
          __dirname,
          './data/bootstrap1/types/worldpay-notification-interface-interaction.json'
        )
      )
      expect(bootstrapper.readJSONFile.mock.calls[2].length).toBe(1)
      expect(bootstrapper.readJSONFile.mock.calls[2][0]).toBe(
        path.resolve(__dirname, './data/bootstrap1/types/worldpay-payment.json')
      )
    })
  })

  describe('createType', () => {
    let bootstrapper

    beforeEach(() => {
      bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )
      bootstrapper.processTypes = jest.fn()
    })

    it('should call `createType` on the underlying Commercetools client with the correct definition', () => {
      bootstrapper.client.createType = jest.fn(() => templateExistingExtension)
      bootstrapper.createType(templateExtension)
      expect(bootstrapper.client.createType.mock.calls.length).toBe(1)
      expect(bootstrapper.client.createType.mock.calls[0].length).toBe(1)
      expect(bootstrapper.client.createType.mock.calls[0][0]).toEqual(
        _.merge({}, templateExtension, { destination: { url: 'http://dummyendpoint.com' } })
      )
    })

    it('should return the data returned from `createType` on the underlying Commercetools client', () => {
      let response
      bootstrapper.client.createType = jest.fn(() => templateExistingExtension)
      response = bootstrapper.createType(templateExtension)
      expect(response).toEqual(templateExistingExtension)
    })
  })

  describe('deleteType', () => {
    let bootstrapper

    beforeEach(() => {
      bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )
      bootstrapper.processTypes = jest.fn()
    })

    it('should call `deleteTypeByKey` on the underlying Commercetools client with the correct params', () => {
      bootstrapper.client.deleteTypeByKey = jest.fn(() => templateExistingExtension)
      bootstrapper.deleteType(templateExistingExtension.key, templateExistingExtension.version)
      expect(bootstrapper.client.deleteTypeByKey.mock.calls.length).toBe(1)
      expect(bootstrapper.client.deleteTypeByKey.mock.calls[0].length).toBe(2)
      expect(bootstrapper.client.deleteTypeByKey.mock.calls[0][0]).toBe(
        templateExistingExtension.key
      )
      expect(bootstrapper.client.deleteTypeByKey.mock.calls[0][1]).toBe(
        templateExistingExtension.version
      )
    })

    it('should return the data returned from `deleteTypeByKey` on the underlying Commercetools client', () => {
      let response
      bootstrapper.client.deleteTypeByKey = jest.fn(() => templateExistingExtension)
      response = bootstrapper.deleteType(templateExtension)
      expect(response).toEqual(templateExistingExtension)
    })
  })

  describe('getExistingType', () => {
    let bootstrapper

    beforeEach(() => {
      bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )
      bootstrapper.processTypes = jest.fn()
    })

    it('should call `getTypeByKey` on the underlying Commercetools client with the correct params', async () => {
      bootstrapper.client.getTypeByKey = jest.fn(() => templateExistingExtension)
      await bootstrapper.getExistingType(templateExtension)
      expect(bootstrapper.client.getTypeByKey.mock.calls.length).toBe(1)
      expect(bootstrapper.client.getTypeByKey.mock.calls[0].length).toBe(1)
      expect(bootstrapper.client.getTypeByKey.mock.calls[0][0]).toBe(templateExistingExtension.key)
    })

    it('should return the data returned from `getTypeByKey` on the underlying Commercetools client', async () => {
      let response
      bootstrapper.client.getTypeByKey = jest.fn(() => templateExistingExtension)
      response = await bootstrapper.getExistingType(templateExtension)
      expect(response).toEqual(templateExistingExtension)
    })
  })

  describe('readJSONFile', () => {
    it('should read in the JSON contents of a given file path', () => {
      const bootstrapper = new CommercetoolsBootstrapper(
        {},
        {
          forceRecreate: true,
          bearerToken: 'myBearerToken',
          extensionEndpoint: 'http://dummyendpoint.com',
          resourcesPath: path.resolve(__dirname, './data/bootstrap1'),
        }
      )

      const data = bootstrapper.readJSONFile(
        path.resolve(
          __dirname,
          './data/bootstrap1/api-extension/worldpay-payment-api-extension.json'
        )
      )

      expect(data).toEqual({
        key: 'worldpay-payment-api-extension',
        destination: {
          type: 'HTTP',
          url: '',
          authentication: {
            type: 'AuthorizationHeader',
            headerValue: '',
          },
        },
        triggers: [
          {
            resourceTypeId: 'payment',
            actions: ['Create', 'Update'],
          },
        ],
        timeoutInMs: 2000,
      })
    })
  })
})
