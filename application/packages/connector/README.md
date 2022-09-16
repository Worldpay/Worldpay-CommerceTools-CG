# Worldpay commercetools connector - connector package

## Package overview

This package contains the code that's executed in response to either a request from commercetools via the
Worldpay connector extension, or when a notification request comes in from Worldpay.

## Configuration

There are a number of configuration parameters required in order to run the connector. Please see the
[Configuration](../../../docs/USER_GUIDE.md) documentation for details on what's required.

## Technical deep dive

There are a number of key technical concepts that are useful to understand in order get a comprehensive
view of the technical implementation. See the links below for separate document on each appropriate area:

- [Creating a connector](CONNECTOR.md) - a closer look at the `connector.js` file
- [PaymentProcessor](src/processor/payment/README.md) - the class responsible for handling requests from
  our commercetools API extension
- [NotificationProcessor](src/processor/notification/README.md) - the class responsible for handling notification
  requests sent from Worldpay
- [CommercetoolsBootstrapper](src/commercetools/README.md) - a closer look at how the bootstrapping process works
