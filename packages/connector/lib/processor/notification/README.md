# NotificationProcessor class

Worldpay's notification system sends updates relating to the state of a payment/transaction:
https://developer.worldpay.com/docs/wpg/manage

Please see the [Deployment Guide](../../docs/DEPLOYMENT_GUIDE.md) for details on getting these notifications
linked to your system.

The `NotificationProcessor` class is similar to the `PaymentProcessor` class in that it's a long-lived
instance that creates an instance of the `NotificationRequestHandler` class for each request, and calls that
class' `process` method for each request, passing in the HTTP payload (which should be a string of XML).

See the Worlpay notifications documentation for example XML messages that are sent in these notification
requests: https://developer.worldpay.com/docs/wpg/manage

# NotificationRequestHandler class

When a notification is received, our system should complete a 2 step process:

1. **Storage** - ensure the notification data is logged
2. **Processing** - process the notification and update the commercetools payment object accordingly

Ideally, the notification should be stored, and then a `200` response immediately returned to Worldpay. The
processing of the notification should then take place.

The `NotificationRequestHandler` really just orchestrates the instantiation of the storage and process handler
classes, and the calling of their `execute` methods. You can pass your own implementation in the
`NotificationRequestHandler` using the `handleStorage` and `handleProcess` options respectively.

Currently, the configuration that gets propagated down to the `NotificationRequestHandler`, is specified
in the `createServer.js` file. Here's the creation of the `NotificationRequestHandler`:

```javascript
notificationProcessor = new NotificationProcessor(commercetoolsClient, config.worldpay)
```

If you wanted to use your own class for storing the notification, you could amend the code to look
something like this:

```javascript
notificationProcessor = new NotificationProcessor(commercetoolsClient, {
  ...config.worldpay,
  handleStorage: MyStorageHandler,
})
```

When a notification is received, the `NotificationRequestHandler` (which receives the same constructor
arguments as the `NotificationProcessor` class) instantiates the class defined on the `handleStorage`
config object. If no class is defined on the `handleStorage` config property then one of two things happens.
If the value of the `handleStorage` property is undefined (i.e. no value set) then the `NotificationRequestHandler`
class defaults to using the `DefaultStorageProcessor` class. If the value of `handleStorage` is set to `null`
then no storage handling will take place.

In the sample code above, when a request comes in, the equivalent of the following code will take place:

```javascript
const storageHandler = new MyStorageHandler(commercetoolsClient, config.worldpay)
storageHandler.execute(notificationObject, notificationXml)
```

The first argument to the `execute` method is an instance of the `WorldpayNotification` class, which is
a parsed version of the original notification XML as passed in via the `notificationXml` argument.

In the same way that you can provide your own storage handler, you can also provide your own process
handler. However, while the notification handler class is instantiated in the same way, the class'
`execute` method is passed slightly diferent parameters.

```javascript
const processHandler = new MyProcessHandler(commercetoolsClient, config.worldpay)
processHandler.execute(notificationObject, storageResult)
```

Here, the `notificationObject` is an instance of the `WorldpayNotification` class, while the `storageResult`
parameter is the result of the storage handler. Given the a storage handler may not have even been used, this
value may well be null.

While the current `createServer.js` file results in both the `DefaultStorageHandler` and `DefaultProcessHandler`
being used, you may want to split these out across independent systems. For example, in an AWS environment, you
may have a lambda function that's responsible for storing the notification in DynamoDB, and then have another
lambda that processes any new items that are added to the relevant DynamoDB table.

Both of these lambda functions could use the `NotificationProcessor` class. The lambda responsible for the
storage would provide it's own `handleStorage` option (which would store the notification in DynamoDB), and
would pass `null` to the `handleProcess` option.

The lambda responsible for the processing of the notification would effectively do the reverse. It would pass
`null` to the `handleStorage` option but provide it's own process handler class in the `handleProcess` option,
which would then be passed in the notification that had been previously stored.
