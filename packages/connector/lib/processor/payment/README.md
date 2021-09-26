# PaymentProcessor class

The `PaymentProcessor` class is instantiated as a long-lived variable. It's responsible for only a few specific
things:

- Validate that the correct options have been passed in to it's contructor
- Determine if a request passed in to it's `execute` method is relevant
- Instantiate and utilise a [`PaymentRequestHandler`](#paymentrequesthandler-class) instance per request

If you take a look at the `execute` method (which is called by the `HttpServer`), you'll see that it's
a very small function that simply checks that the request is relevant to the processor (it should be
unless something is mis-configured in commercetools) and then dispatches the request to the
`PaymentRequestHandler.process` method by first instantiating a new instance of the `PaymentRequestHandler`
class with relevant config data, and then calling the `process` method with HTTP payload and headers.

The payload should be a JSON object as described here in the commercetools docs:
https://docs.commercetools.com/api/projects/api-extensions#input. The `PaymentRequestHandler` will
only receive requests where the `action` is `Create` and the `resource` is of type `payment` (specified in
the `resource.typeId` property)

The [PaymentRequestHandler](#paymentrequesthandler-class) class is where the bulk of the logic resides regarding the processing of an incoming request and the subsequent communication with Worldpay.

# PaymentRequestHandler class

The entrypoint for this class is the `process` method. Here you can see that the functionality involves:

- Getting the customer and cart objects from commercetools
- Communicating with Worldpay to ultimately get a redirect url
- Returning a list of actions for commercetools to perform on the payment object

For details on the data that Worldpay expects to receive and reply with, see the following page:
https://developer.worldpay.com/docs/wpg/hostedintegration/paymentrequests

For details regarding the response that we send to commercetools, see:
https://docs.commercetools.com/api/projects/api-extensions#updates-requested

## Sending a request to Worldpay

Take a look at the `sendWorldpayXml` method and you'll see that we break down the logic in to two steps.
First of all we build the XML message using the `PaymentOrderBuilder` class in the `buildXmlMessage` method,
and then we call the `postMessageToWorldpay` which is responsible for firing off the request to Worldpay.

It's in this `postMessageToWorldpay` where we specify our Worldpay XML username and password along with
the endpoint that we want to use. These will have been passed in as configuration details, propagated down
from the entrypoint file from which your server was initialised.

As long as we get a `200` status response from Worldpay then we pass the response over to the
`buildCommercetoolsActions` method in order to respond to commercetools.

## Responding to commercetools

If you familiarise yourself with the response that commercetools expects
(via https://docs.commercetools.com/api/projects/api-extensions#updates-requested) then the code here will
look fairly straightforward.

The first thing that we do is to add an action to our `actions` array which tells commercetools to store
an interface interaction against this payment object. This interface interaction is basically just a log of
something that occured between our system and our chosen payment service provider (Worldpay). In this case
we're simply logging the original XML request along with any response from Worldpay. If, after this point
we realise that there's an error in the response, then we still have the details of the request and any
erroneous response, logged against the payment object in an interface interaction.

Assuming that there wasn't an error, then we continue to add a bunch of additional `actions` for commercetools
to process, including the setting of various custom fields, and adding an initial transaction to the payment
object.
