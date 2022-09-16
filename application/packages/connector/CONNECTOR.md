# Creating a Connector

A connector that supports the payment extension and notification endpoints can be created in several ways, but mainly provide wrappers around the functionality available from the `Connector`.
This connector has all the functionality to handle events from Commercetools and process Worldpay notification events.

## Should I only call the exported function once?

Yes. While you theoretically could call the function multiple times, it would then try and create connectors, which would result in an error being thrown.

## What's the function actually doing?

Ultimately, it's creating an instance the processors for handling payment and notification events. They can be deployed into a AWS lambda function handle EventBridge events directly from Commercetools, or a lambda to be wired to receive HTTPS calls from Worldpay. Or they can be deployed as an Azure function, which listens on an HTTPS port for events from Commercetools and/or Worldpay.
The connectors are independent of the communication protocol.

The function takes care of the setting up the connections using the configuration passed into the constructor.
This involves instantiating 3 classes:

- `CommercetoolsClient` - takes care of the communication with your commercetools project
- `PaymentProcessor` - powers the commercetools payment API extension
- `NotificationsProcessor` - handles incoming notifications from Worldpay

You'll notice that each of these classes is passed pieces of the `config` parameter that's passed into the
exported function.

Also worth noting is that the instances of these 3 classes are stored in the `Connector` module. They are
therefore long-lived variables, and are designed to not need to be instantiated per request.
