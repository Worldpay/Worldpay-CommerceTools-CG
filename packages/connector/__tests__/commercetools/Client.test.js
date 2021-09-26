'use strict'

const { errors } = require('@commercetools/sdk-middleware-http')
const CommercetoolsClient = require('../../lib/commercetools/Client')

describe('CommercetoolsClient', () => {
  let client

  beforeEach(() => {
    client = new CommercetoolsClient({
      projectKey: 'dummyprojectkey',
      clientId: 'dummyclientid',
      clientSecret: 'dummyclientsecret',
      apiUrl: 'https://dummyapiurl.com',
      authUrl: 'https://dummyauthurl.com',
    })
  })

  describe('getCustomerById', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      let response

      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))

      response = await client.getCustomerById('customerId')

      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'GET',
        uri: '/dummyprojectkey/customers/customerId',
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('getCartById', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      let response

      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))

      response = await client.getCartById('cartId')

      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'GET',
        uri: '/dummyprojectkey/carts/cartId',
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('getApiExtensionByKey', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      let response

      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))

      response = await client.getApiExtensionByKey('myExtensionKey')

      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'GET',
        uri: '/dummyprojectkey/extensions/key=myExtensionKey',
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('createApiExtension', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      let response

      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))

      response = await client.createApiExtension({
        key: 'testKey',
        other: 'more data',
      })

      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'POST',
        uri: '/dummyprojectkey/extensions',
        body: {
          key: 'testKey',
          other: 'more data',
        },
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('deleteApiExtensionByKey', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      let response

      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))

      response = await client.deleteApiExtensionByKey('myExtensionKey', 1)

      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'DELETE',
        uri: '/dummyprojectkey/extensions/key=myExtensionKey?version=1',
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('getTypeByKey', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      let response

      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))

      response = await client.getTypeByKey('myTypeKey')

      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'GET',
        uri: '/dummyprojectkey/types/key=myTypeKey',
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('createType', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      let response

      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))

      response = await client.createType({
        key: 'testKey',
        other: 'more data',
      })

      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'POST',
        uri: '/dummyprojectkey/types',
        body: {
          key: 'testKey',
          other: 'more data',
        },
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('deleteTypeByKey', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      let response

      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))

      response = await client.deleteTypeByKey('myTypeKey', 1)

      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'DELETE',
        uri: '/dummyprojectkey/types/key=myTypeKey?version=1',
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('getPaymentById', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      let response

      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))

      response = await client.getPaymentById('paymentId')

      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'GET',
        uri: '/dummyprojectkey/payments/paymentId',
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('addInterfaceInteractionToPayment', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      let response

      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))

      response = await client.addInterfaceInteractionToPayment(
        { id: 'paymentId', version: 2 },
        {
          type: 'test-type',
          fields: {
            name: 'Fred',
          },
        }
      )

      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'POST',
        uri: '/dummyprojectkey/payments/paymentId',
        body: {
          version: 2,
          actions: [
            {
              action: 'addInterfaceInteraction',
              type: 'test-type',
              fields: {
                name: 'Fred',
              },
            },
          ],
        },
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('changePaymentTransactionState', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))
      const response = await client.changePaymentTransactionState(
        { id: 'test-payment-id', version: 3 },
        'my-transaction-id',
        'Success'
      )
      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'POST',
        uri: '/dummyprojectkey/payments/test-payment-id',
        body: {
          version: 3,
          actions: [
            {
              action: 'changeTransactionState',
              transactionId: 'my-transaction-id',
              state: 'Success',
            },
          ],
        },
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('addPaymentTransaction', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      jest.useFakeTimers('modern').setSystemTime(new Date('2020-01-01 13:25:12.546').getTime())
      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))
      const response = await client.addPaymentTransaction(
        { id: 'test-payment-id', version: 3 },
        { type: 'Authorization', state: 'Pending' }
      )
      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'POST',
        uri: '/dummyprojectkey/payments/test-payment-id',
        body: {
          version: 3,
          actions: [
            {
              action: 'addTransaction',
              transaction: {
                type: 'Authorization',
                state: 'Pending',
                timestamp: '2020-01-01T13:25:12.546Z',
              },
            },
          ],
        },
      })
      expect(response).toEqual({ name: 'Testing' })
      jest.useRealTimers()
    })
  })

  describe('applyOrderActions', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))
      const response = await client.applyOrderActions({ id: 'test-order-id', version: 4 }, [
        'test-value-1',
        'test-value-2',
      ])
      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'POST',
        uri: '/dummyprojectkey/orders/test-order-id',
        body: {
          version: 4,
          actions: ['test-value-1', 'test-value-2'],
        },
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('applyPaymentActions', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))
      const response = await client.applyPaymentActions({ id: 'test-payment-id', version: 5 }, [
        'test-value-1',
        'test-value-2',
      ])
      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'POST',
        uri: '/dummyprojectkey/payments/test-payment-id',
        body: {
          version: 5,
          actions: ['test-value-1', 'test-value-2'],
        },
      })
      expect(response).toEqual({ name: 'Testing' })
    })
  })

  describe('getOrderByPaymentId', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      client.execute = jest.fn(() => ({
        results: [{ id: 'test-order-id' }],
      }))
      const response = await client.getOrderByPaymentId('test-payment-id')
      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'GET',
        uri: '/dummyprojectkey/orders?where=paymentInfo(payments(id%3D%22test-payment-id%22))',
      })
      expect(response).toEqual({ id: 'test-order-id' })
    })
  })

  describe('getOrderById', () => {
    it('should call the `execute` method with the expected parameters', async () => {
      client.execute = jest.fn(() => ({
        id: 'test-order-id',
      }))
      const response = await client.getOrderById('test-order-id')
      expect(client.execute.mock.calls.length).toBe(1)
      expect(client.execute.mock.calls[0].length).toBe(1)
      expect(client.execute.mock.calls[0][0]).toEqual({
        method: 'GET',
        uri: '/dummyprojectkey/orders/test-order-id',
      })
      expect(response).toEqual({ id: 'test-order-id' })
    })
  })

  describe('createOrderFromCartId', () => {
    let getCartByIdSpy

    beforeEach(() => {
      getCartByIdSpy = jest.spyOn(client, 'getCartById')
    })

    afterEach(() => {
      getCartByIdSpy.mockRestore()
    })

    it('should throw an error when no cart object can be found for the given cart id', async () => {
      getCartByIdSpy.mockResolvedValue(null)
      await expect(client.createOrderFromCartId('123')).rejects.toEqual(
        new Error('Unable to create order from cart. No such cart id: 123')
      )
    })

    it('should call the `execute` method with the expected parameters when a cart object is found', async () => {
      getCartByIdSpy.mockResolvedValue({
        id: 'my-cart-id',
        version: 2,
      })
      client.execute = jest.fn(() => ({
        name: 'Testing',
      }))
      await client.createOrderFromCartId('my-cart-id')
      expect(client.execute).toHaveBeenCalledTimes(1)
      expect(client.execute).toHaveBeenCalledWith({
        uri: '/dummyprojectkey/orders',
        method: 'POST',
        body: {
          id: 'my-cart-id',
          version: 2,
        },
      })
    })
  })

  describe('execute', () => {
    it('should call the underlying Commercetools client with the options passed in', async () => {
      const mockResponseData = {
        statusCode: 200,
        body: {},
      }
      client.client.execute = jest.fn(() => mockResponseData)
      await client.execute({
        method: 'GET',
        uri: '/path/to/resource',
      })
      expect(client.client.execute.mock.calls.length).toBe(1)
      expect(client.client.execute.mock.calls[0].length).toBe(1)
      expect(client.client.execute.mock.calls[0][0]).toEqual({
        method: 'GET',
        uri: '/path/to/resource',
      })
    })

    it('should return back the body of the response from Commercetools when available', async () => {
      const mockResponseData = {
        statusCode: 200,
        body: {
          testItem1: 123,
          testItem2: 'testing',
        },
      }
      client.client.execute = jest.fn(() => mockResponseData)
      const response = await client.execute({
        method: 'GET',
        uri: '/path/to/resource',
      })
      expect(response).toEqual(mockResponseData.body)
    })

    it('should throw an exception when the status code is not available', async () => {
      let exception

      client.client.execute = jest.fn(() => ({
        body: {
          test: 1,
        },
      }))

      try {
        await client.execute({
          method: 'GET',
          uri: '/path/to/resource',
        })
      } catch (e) {
        exception = e
      }

      expect(exception).toBeInstanceOf(Error)
    })

    it('should return back null when a GET request returns a status code of 404', async () => {
      client.client.execute = jest.fn(() => {
        throw new errors.NotFound('Dummy not found message')
      })
      const response = await client.execute({
        method: 'GET',
        uri: '/path/to/resource',
      })
      expect(response).toBeNull()
    })

    it('should throw the exception generated from the Commercetools middleware when the status code is >= 400', () => {
      client.client.execute = jest.fn(() => {
        throw new errors.InternalServerError('Server error')
      })

      expect(async () => {
        await client.execute({
          method: 'GET',
          uri: '/path/to/resource',
        })
      }).rejects.toBeInstanceOf(errors.InternalServerError)
    })

    it('should throw an exception when the status code is an unexpected code less than 200', async () => {
      let exception
      client.client.execute = jest.fn(() => ({
        statusCode: 100,
      }))

      try {
        await client.execute({
          method: 'GET',
          uri: '/path/to/resource',
        })
      } catch (e) {
        exception = e
      }

      expect(exception).toBeInstanceOf(Error)
    })

    it('should return back null the status code is valid but there is no body property', async () => {
      client.client.execute = jest.fn(() => ({
        statusCode: 200,
      }))
      const response = await client.execute({
        method: 'GET',
        uri: '/path/to/resource',
      })
      expect(response).toBeNull()
    })
  })
})
