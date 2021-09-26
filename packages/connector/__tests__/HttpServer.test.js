'use strict'

const request = require('supertest')
const log = require('../lib/utils/log')
const HttpServer = require('../lib/httpserver')
const PaymentProcessorException = require('../lib/processor/payment/PaymentProcessorException')

const notificationData = require('./processor/notification/data/notification')

describe('HttpServer', () => {
  describe('constructor', () => {
    it('should throw an exception when the port is not an integer', () => {
      expect(() => {
        new HttpServer(
          {
            payment: () => {},
            notification: () => {},
          },
          {
            port: 'test',
            bearerToken: 'myBearerToken',
          }
        )
      }).toThrow()
    })

    it('should throw an exception when the bearerToken is missing', () => {
      expect(() => {
        new HttpServer(
          {
            payment: () => {},
            notification: () => {},
          },
          { port: 3000 }
        )
      }).toThrow()

      expect(() => {
        new HttpServer(
          {
            payment: () => {},
            notification: () => {},
          },
          {
            port: 3000,
            bearerToken: '',
          }
        )
      }).toThrow()
    })

    it('should call the `create` method', () => {
      const createSpy = jest.spyOn(HttpServer.prototype, 'create')
      new HttpServer(
        {
          payment: () => {},
          notification: () => {},
        },
        {
          port: 3000,
          bearerToken: 'myBearerToken',
        }
      )
      expect(createSpy).toHaveBeenCalledTimes(1)
      createSpy.mockRestore()
    })
  })

  describe('create', () => {
    it('should return the HttpServer instance', () => {
      const server = new HttpServer(
        {
          payment: {},
          notification: {},
        },
        {
          port: 3000,
          bearerToken: 'myBearerToken',
        }
      )

      const response = server.create()
      expect(response).toBeInstanceOf(HttpServer)
    })

    it('should add the payment route if a payment processor is passed in', () => {
      const server = new HttpServer(
        {
          payment: {},
        },
        {
          port: 3000,
          bearerToken: 'myBearerToken',
        }
      )
      server.app.post = jest.fn()
      server.create()
      expect(server.app.post).toHaveBeenCalledTimes(1)
      expect(server.app.post).toHaveBeenCalledWith('', expect.any(Function), expect.any(Function))
    })

    it('should not add the payment route if a payment processor is not passed in', () => {
      const server = new HttpServer(
        {},
        {
          port: 3000,
          bearerToken: 'myBearerToken',
        }
      )
      server.app.post = jest.fn()
      server.create()
      expect(server.app.post).toHaveBeenCalledTimes(0)
    })

    it('should add the notification route if a notification processor is passed in', () => {
      const server = new HttpServer(
        {
          notification: {},
        },
        {
          port: 3000,
          bearerToken: 'myBearerToken',
        }
      )
      server.app.post = jest.fn()
      server.create()
      expect(server.app.post).toHaveBeenCalledTimes(1)
      expect(server.app.post).toHaveBeenCalledWith('/notification', expect.anything())
    })

    it('should not add the notification route if a notification processor is not passed in', () => {
      const server = new HttpServer(
        {},
        {
          port: 3000,
          bearerToken: 'myBearerToken',
        }
      )
      server.app.post = jest.fn()
      server.create()
      expect(server.app.post).toHaveBeenCalledTimes(0)
    })

    it('should add both notification and payment routes when both processors passed in', () => {
      const server = new HttpServer(
        {
          notification: {},
          payment: {},
        },
        {
          port: 3000,
          bearerToken: 'myBearerToken',
        }
      )
      server.app.post = jest.fn()
      server.create()
      expect(server.app.post).toHaveBeenCalledTimes(2)
      expect(server.app.post).toHaveBeenCalledWith('/notification', expect.anything())
      expect(server.app.post).toHaveBeenCalledWith('', expect.any(Function), expect.anything())
    })
  })

  describe('as server', () => {
    describe('start/stop', () => {
      it('can be started and stopped', async () => {
        const server = new HttpServer(
          {
            payment: {},
            notification: {},
          },
          {
            port: 3000,
            bearerToken: 'myBearerToken',
          }
        )

        const response = await server.start()

        expect(server.isRunning).toBe(true)
        expect(server.port).toBe(3000)
        expect(response).toBeDefined()

        await server.stop()

        expect(server.isRunning).toBe(false)
        expect(server.port).toBe(3000)
      })

      it('can be started and stopped multiple times', async () => {
        const server = new HttpServer(
          {
            payment: {},
            notification: {},
          },
          {
            port: 3000,
            bearerToken: 'myBearerToken',
          }
        )
        await server.start()

        expect(server.isRunning).toBe(true)
        expect(server.port).toBe(3000)

        await server.stop()

        expect(server.isRunning).toBe(false)
        expect(server.port).toBe(3000)

        await server.start()

        expect(server.isRunning).toBe(true)
        expect(server.port).toBe(3000)

        await server.stop()

        expect(server.isRunning).toBe(false)
        expect(server.port).toBe(3000)
      })

      describe('Requests to GET /health', () => {
        it('should return a 200 status with enriched health check data', async () => {
          const mockExecute = jest.fn()
          const server = new HttpServer(
            {
              payment: {
                execute: mockExecute,
              },
              notification: {},
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )
          await server.start()
          const response = await request(server.getApp())
            .get('/health')
            .expect('Content-Type', 'application/health+json; charset=utf-8')
            .expect(200)

          expect(mockExecute.mock.calls.length).toBe(0)
          expect(response.text).toBe('{"status":"pass"}')
          expect(response.body).toEqual({ status: 'pass' })

          await server.stop()
        })

        it('should return a 200 status with enriched health check data if Authorization header passed in', async () => {
          const mockExecute = jest.fn()
          const server = new HttpServer(
            {
              payment: {
                execute: mockExecute,
              },
              notification: {},
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )
          await server.start()
          const response = await request(server.getApp())
            .get('/health')
            .set('Authorization', 'Bearer invalidTestToken')
            .expect('Content-Type', 'application/health+json; charset=utf-8')
            .expect(200)

          expect(mockExecute.mock.calls.length).toBe(0)
          expect(response.text).toBe('{"status":"pass"}')
          expect(response.body).toEqual({ status: 'pass' })

          await server.stop()
        })
      })

      describe('Requests to POST /', () => {
        it('should return a 401 status if the bearer token does not match server token`', async () => {
          const mockExecute = jest.fn(() => 'Dummy payment response')
          const server = new HttpServer(
            {
              payment: {
                execute: mockExecute,
              },
              notification: {},
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )
          await server.start()

          await request(server.getApp())
            .post('/')
            .set('Authorization', 'Bearer incorrecttoken')
            .expect(401)

          await server.stop()
        })

        it('should return a 200 status if the bearer token matches server token`', async () => {
          const mockExecute = jest.fn(() => 'Dummy payment response')
          const server = new HttpServer(
            {
              payment: {
                execute: mockExecute,
              },
              notification: {},
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )
          await server.start()

          await request(server.getApp())
            .post('/')
            .set('Authorization', 'Bearer myBearerToken')
            .set('Content-Type', 'application/json')
            .expect(200)

          await server.stop()
        })

        it('should return a 415 status if the `Content-Type` header is not `application/json`', async () => {
          const mockExecute = jest.fn(() => 'Dummy payment response')
          const server = new HttpServer(
            {
              payment: {
                execute: mockExecute,
              },
              notification: {},
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )
          await server.start()

          await request(server.getApp())
            .post('/')
            .set('Authorization', 'Bearer myBearerToken')
            .expect(415)

          await request(server.getApp())
            .post('/')
            .set('Authorization', 'Bearer myBearerToken')
            .set('Content-Type', 'text/xml')
            .expect(415)

          await server.stop()
        })

        it('should call the `payment` method on the processor`', async () => {
          const mockExecute = jest.fn(() => 'Dummy payment response')
          const server = new HttpServer(
            {
              payment: {
                execute: mockExecute,
              },
              notification: {},
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )
          await server.start()
          const response = await request(server.getApp())
            .post('/')
            .set('Authorization', 'Bearer myBearerToken')
            .set('Content-Type', 'application/json')
            .expect(200)

          expect(mockExecute.mock.calls.length).toBe(1)
          expect(response.text).toBe('Dummy payment response')

          await server.stop()
        })

        it('should pass through an object when JSON data is passed in', async () => {
          const mockExecute = jest.fn()
          const server = new HttpServer(
            {
              payment: {
                execute: mockExecute,
              },
              notification: {},
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )

          await server.start()
          await request(server.getApp())
            .post('/')
            .set('Authorization', 'Bearer myBearerToken')
            .set('Content-Type', 'application/json')
            .set('Accept', '*/*')
            .send({ foo: 1, bar: 'test' })
            .expect(200)

          expect(mockExecute.mock.calls.length).toBe(1)
          expect(mockExecute.mock.calls[0].length).toBe(2)
          expect(mockExecute.mock.calls[0][0]).toEqual({ foo: 1, bar: 'test' })
          expect(mockExecute.mock.calls[0][1]).toMatchObject({
            accept: '*/*',
          })

          await server.stop()
        })

        it('should return the data returned by the payment processor method', async () => {
          const mockExecute = jest.fn(() => 'Dummy payment response')
          const server = new HttpServer(
            {
              payment: {
                execute: mockExecute,
              },
              notification: {},
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )
          await server.start()
          let response = await request(server.getApp())
            .post('/')
            .send()
            .set('Authorization', 'Bearer myBearerToken')
            .set('Content-Type', 'application/json')
            .expect(200)

          expect(response.text).toBe('Dummy payment response')

          await server.stop()
        })

        it('should return a 400 status when the `execute` method throws an exception of type PaymentProcessorException', async () => {
          const mockExecute = jest.fn(() => {
            throw new PaymentProcessorException('Dummy exception')
          })
          const server = new HttpServer(
            {
              payment: {
                execute: mockExecute,
              },
              notification: {},
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )

          await server.start()
          await request(server.getApp())
            .post('/')
            .set('Authorization', 'Bearer myBearerToken')
            .set('Content-Type', 'application/json')
            .expect(400)

          await server.stop()
        })

        it('should return a 500 status when the `execute` method throws an exception not of type PaymentProcessorException', async () => {
          const mockExecute = jest.fn(() => {
            throw new Error('Dummy exception')
          })
          const server = new HttpServer(
            {
              payment: {
                execute: mockExecute,
              },
              notification: {},
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )

          await server.start()
          await request(server.getApp())
            .post('/')
            .set('Authorization', 'Bearer myBearerToken')
            .set('Content-Type', 'application/json')
            .expect(500)

          await server.stop()
        })
      })

      describe('Requests to POST /notification', () => {
        it('should return a 200 status with body of [OK] if no exceptions`', async () => {
          const server = new HttpServer(
            {
              notification: {
                execute: () => ({
                  storage: Promise.resolve('Dummy success response'),
                }),
              },
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )
          await server.start()

          const response = await request(server.getApp())
            .post('/notification')
            .send(notificationData)
            .expect(200)
          expect(response.text).toBe('[OK]')

          await server.stop()
        })

        it('should return a 500 status if the notification processor throws an exception`', async () => {
          const server = new HttpServer(
            {
              notification: {
                execute: () => {
                  throw new Error('Dummy error from `execute`')
                },
              },
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )
          await server.start()

          const response = await request(server.getApp()).post('/notification').expect(500)
          expect(response.text).toBe('')

          await server.stop()
        })

        it('should return a 500 if the storage handler throws an exception`', async () => {
          const server = new HttpServer(
            {
              notification: {
                execute: () => ({
                  storage: Promise.reject(new Error('Dummy error from `process`')),
                }),
              },
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )
          await server.start()

          const response = await request(server.getApp()).post('/notification').expect(500)
          expect(response.text).toBe('')

          await server.stop()
        })

        it('should call the `process` method if the `storage` method does not throw', async () => {
          const server = new HttpServer(
            {
              notification: {
                execute: () => ({
                  storage: Promise.resolve({ test: 'storage' }),
                  process: Promise.resolve({ test: 'process' }),
                }),
              },
            },
            {
              port: 3000,
              bearerToken: 'myBearerToken',
            }
          )
          await server.start()

          const logSillySpy = jest.spyOn(log, 'silly')
          const response = await request(server.getApp())
            .post('/notification')
            .send(notificationData)
            .expect(200)

          expect(response.text).toBe('[OK]')
          expect(logSillySpy).toHaveBeenCalledWith(
            'Notification processor `storage` stage complete',
            {
              result: { test: 'storage' },
            }
          )
          expect(logSillySpy).toHaveBeenCalledWith(
            'Notification processor `process` stage complete',
            {
              result: { test: 'process' },
            }
          )

          await server.stop()
          logSillySpy.mockRestore()
        })
      })

      it('should not call the `process` method if the `storage` method throws an error', async () => {
        const server = new HttpServer(
          {
            notification: {
              execute: () => ({
                storage: Promise.reject('test error'),
                process: Promise.resolve({ test: 'process' }),
              }),
            },
          },
          {
            port: 3000,
            bearerToken: 'myBearerToken',
          }
        )
        await server.start()

        const logSillySpy = jest.spyOn(log, 'silly')
        await request(server.getApp()).post('/notification').send(notificationData).expect(500)

        expect(logSillySpy).not.toHaveBeenCalledWith(
          'Notification processor `storage` stage complete',
          {
            result: { test: 'storage' },
          }
        )
        expect(logSillySpy).not.toHaveBeenCalledWith(
          'Notification processor `process` stage complete',
          {
            result: { test: 'process' },
          }
        )

        await server.stop()
        logSillySpy.mockRestore()
      })
    })

    it('should log an error if the `process` method throws an error', async () => {
      const server = new HttpServer(
        {
          notification: {
            execute: () => ({
              storage: Promise.resolve({ test: 1 }),
              process: Promise.reject('test error'),
            }),
          },
        },
        {
          port: 3000,
          bearerToken: 'myBearerToken',
        }
      )
      await server.start()

      const logErrorSpy = jest.spyOn(log, 'error')
      await request(server.getApp()).post('/notification').send(notificationData).expect(200)
      await server.stop()
      expect(logErrorSpy).toHaveBeenCalledWith('Error processing notification', expect.anything())
      logErrorSpy.mockRestore()
    })
  })

  describe('as lambda', () => {
    describe('start', () => {
      it('should not attempt to listen on a port', async () => {
        const server = new HttpServer(
          {
            payment: {},
            notification: {},
          },
          {
            port: 3000,
            bearerToken: 'myBearerToken',
            runAsServer: false,
          }
        )

        const response = server.start()
        expect(response).toBeUndefined()
        expect(server.isRunning).toBe(false)
      })
    })

    describe('stop', () => {
      it('should not attempt to stop the server', async () => {
        const server = new HttpServer(
          {
            payment: {},
            notification: {},
          },
          {
            port: 3000,
            bearerToken: 'myBearerToken',
            runAsServer: false,
          }
        )

        server.start()
        expect(server.stop()).toBeUndefined()
      })
    })
  })
})
