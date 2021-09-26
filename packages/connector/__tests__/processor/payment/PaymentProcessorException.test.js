'use strict'

const PaymentProcessorException = require('../../../lib/processor/payment/PaymentProcessorException')
const { codes: errorCodes } = require('../../../lib/processor/payment/errors')

describe('PaymentProcessorException', () => {
  describe('constructor', () => {
    it('should ignore any errors that are not valid', () => {
      let exception = new PaymentProcessorException('test')
      expect(exception.errors).toEqual([])

      exception = new PaymentProcessorException(['test'])
      expect(exception.errors).toEqual([])

      exception = new PaymentProcessorException([{ test: 1 }])
      expect(exception.errors).toEqual([])

      exception = new PaymentProcessorException([{ code: 'invalid' }])
      expect(exception.errors).toEqual([])
    })

    it('should store valid errors in the `errors` property', () => {
      const exception = new PaymentProcessorException([
        {
          code: errorCodes.NO_CUSTOMER_ANONYMOUS_ID,
        },
      ])
      expect(exception.errors).toEqual([
        {
          code: 'InvalidInput',
          message: 'No customer id or anonymous id on payment object',
        },
      ])
    })

    it('should filter out invalid errors', () => {
      const exception = new PaymentProcessorException([
        {
          code: errorCodes.NO_CUSTOMER_ANONYMOUS_ID,
        },
        {
          code: 'invalid',
        },
        'invalidItem',
      ])
      expect(exception.errors).toEqual([
        {
          code: 'InvalidInput',
          message: 'No customer id or anonymous id on payment object',
        },
      ])
    })
  })

  describe('toString', () => {
    it('should return the correctly formatted data when the errors array is empty', () => {
      expect(new PaymentProcessorException([]).toString()).toBe('Payment processor exception: []')
    })

    it('should return the correctly formatted data when the errors array is populated with one item', () => {
      expect(
        new PaymentProcessorException([
          {
            code: errorCodes.NO_CUSTOMER_ANONYMOUS_ID,
          },
        ]).toString()
      ).toBe(
        'Payment processor exception: [{"code":"InvalidInput","message":"No customer id or anonymous id on payment object"}]'
      )

      expect(
        new PaymentProcessorException([
          {
            code: errorCodes.NO_CART,
            info: {
              cartId: '1234',
            },
          },
        ]).toString()
      ).toBe(
        'Payment processor exception: [{"code":"InvalidOperation","message":"No cart found for the given cart id `1234`"}]'
      )
    })

    it('should return the correctly formatted data when the errors array is populated with multiple items', () => {
      expect(
        new PaymentProcessorException([
          {
            code: errorCodes.NO_CUSTOMER_ANONYMOUS_ID,
          },
          {
            code: errorCodes.NO_CART,
            info: {
              cartId: '1234',
            },
          },
        ]).toString()
      ).toBe(
        'Payment processor exception: [{"code":"InvalidInput","message":"No customer id or anonymous id on payment object"},{"code":"InvalidOperation","message":"No cart found for the given cart id `1234`"}]'
      )
    })
  })

  describe('toJSON', () => {
    it('should return an object with only the errors array exposed', () => {
      expect(new PaymentProcessorException([]).toJSON()).toEqual({ errors: [] })

      expect(
        new PaymentProcessorException([
          {
            code: errorCodes.NO_CUSTOMER_ANONYMOUS_ID,
          },
        ]).toJSON()
      ).toEqual({
        errors: [
          {
            code: 'InvalidInput',
            message: 'No customer id or anonymous id on payment object',
          },
        ],
      })

      expect(
        new PaymentProcessorException([
          {
            code: errorCodes.NO_CART,
            info: {
              cartId: '1234',
            },
          },
        ]).toJSON()
      ).toEqual({
        errors: [
          {
            code: 'InvalidOperation',
            message: 'No cart found for the given cart id `1234`',
          },
        ],
      })
    })
  })
})
