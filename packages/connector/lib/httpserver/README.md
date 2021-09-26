# HttpServer class

This class is a wrapper around an [Express](https://expressjs.com) app. The routes that it configures on the express app are based on the processors that are passed in to the constructor. This class is a candidate for removal if you create your own implementation, perhaps utilising the payment and notification processors completely independently.

## Routes added to the express app

The first parameter to the `HttpServer` class is an object which expects to have a `payment` and/or `notification` property. The `payment` property must be an instance of the `PaymentProcessor` class, while the `notification` property must be an instance of the `NotificationProcessor` class.

If the `payment` property is populated then we add a route as seen in the following snippet of code:

```javascript
if (this.paymentProcessor) {
  log.debug('Adding payment route')
  this.app.post(ROUTE.PAYMENT, this.auth, this.paymentRouteHandler.bind(this))
}
```

The path of the route (and indeed all routes) is defined in the `packages/connector/lib/constants.js` file:

```javascript
module.exports = {
  ROUTE: {
    HEALTH: '/health',
    PAYMENT: '',
    NOTIFICATION: '/notification',
  },
  ...
}
```

As can be seen in this config, the `ROUTE.PAYMENT` path is an empty string, meaning it maps to the base url of the server, while the path for notifications is `/notifications`. We also have a `/health` route for determining the server status.

## Handling an incoming request

Assuming both payment and notification processors were passed in to the class, and assuming that we're running the `entrypoint-local.js` file locally, you'll have a server exposing listening for the following paths:

- `POST http://localhost:3000/`
- `POST http://localhost:3000/notification`
- `GET http://localhost:3000/health`

Requests to these endpoints using the appropriate HTTP method (GET or POST) will the respective function
in the `HttpServer` instance method:

- `paymentRouteHandler`
- `notificationRouteHandler`
- `healthRouteHandler`

The `healthRouteHandler` is a straightforward response as per https://tools.ietf.org/id/draft-inadarei-api-health-check-01.html

The `notificationRouteHandler` and `healthRouteHandler` methods both call the `execute` method on their respective
processors, passing in the request body (and in the case of the payment processor, the request headers).

### Payment processor response

Remember that the payment processor is going to be responding to an incoming request from commercetools, and so the
response needs to be in a format that commercetools understands. For more details, see
https://docs.commercetools.com/api/projects/api-extensions#response

For the payment processor, as long as the `execute` method doesn't throw an exception, then a `200` status is returned
along with a body containing a JSON string representing an object containing a list of actions for commercetools to perform on the payment object that initiated the request.

If an error was caught from the execution of the `execute` method, then there are two scenarios we deal with. If the exception is of type `PaymentProcessorException` then we're able to return a `400` status to commercetools along with a list of
errors that can ultimately be returned to the calling UI code.

If the exception is NOT an instance of `PaymentProcessorException` then we return a `500` error to commercetools, as this
is an unexpected error that cannot handle.

See the [PaymentProcessor documentation](../processor/payment/README.md) for further details on
payment request processing.

### Notification processor response

The notification processor is responding to an incoming Worldpay notification requests:
https://developer.worldpay.com/docs/wpg/manage

As per the Worldpay documentation, we almost always return a `200` status with a body of `[OK]`. The only scenario
under which this is not returned is when we fail to store the incoming notification. The storage of the notification
is the first stage of processing a notification and should precede any processing of the notification. If storage of
the notification fails then there is a fundamental system problem which needs to be resolved. In this scenario we
respond with a `500` status.

See the [NotificationProcessor documentation](../processor/notification/README.md) for further details on
notification request processing.

## Validating incoming requests

The payment requests are validated using the `auth` middleware specified in this line:

```javascript
this.app.post(ROUTE.PAYMENT, this.auth, this.paymentRouteHandler.bind(this))
```

This `auth` middleware is defined in `packages/connector/lib/middleware/auth.js` and validates the request by checking
the bearer token passed in on the `Authorization` HTTP header.

Notification requests should be validated using client certificates as per the Worldpay documentation:
https://developer.worldpay.com/docs/wpg/manage#authenticating-the-sender
