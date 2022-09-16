# PaymentProcessor class

The `PaymentProcessor` class is instantiated as a long-lived variable. It's responsible for the following:

- Validate that the correct options have been passed into its constructor
- Determine if a request passed in to its `execute` method is relevant for 1 or more `RequestHandler` instances it instantiates, by calling their `isRequestApplicable` function 
- Invoke the `process` function on each handler that claims to process the request
- Merge the corresponding actions that each handlers return
- Return a response with the merged actions

If you take a look at the `execute` method, you'll see that it is
a very small function that simply creates all available handlers, and checks that the request is relevant to the handler.
There may be more than one applicable handler - but at this moment they are mutually exclusive.
It then dispatches the request to each handler's `PaymentRequestHandler.process` method 
class with relevant config data, and then calling the `process` method with HTTP payload and headers.

The payload should be a JSON object as described here in the commercetools docs:
https://docs.commercetools.com/api/projects/api-extensions#input. The `PaymentRequestHandler` will
only receive requests where the `action` is `Create` and the `resource` is of type `payment` (specified in
the `resource.typeId` property).

There is one exception to this: for Apple Pay, a payment session needs to be initiated with Apple. This will be done
on the `Create` event of the payment. The result is stored in the payment object, after which the payment session starts
in the browser. Apple signs a payment authentication that the user confirms, and the result is stored in the existing payment object.
This causes an `Update` action to be received by the `PaymentProcessor`. Only this update triggers communication with Worldpay. 

The [WorldpayCommunicationRequestHandler](#WorldpayCommunicationRequestHandler.js) class is where the bulk of the logic resides regarding the processing of an incoming request and the subsequent communication with Worldpay.

# PaymentRequestHandler class

The entrypoint for this class is the `process` method. This class holds a number of delegates to handle the work, and does the following:

## Responding to commercetools

Once you familiarise yourself with the response that commercetools expects
(via https://docs.commercetools.com/api/projects/api-extensions#updates-requested) then the code in the handlers will
look straightforward.

## WorldpayCommunicationRequestHandler.js

Here you can see that the functionality involves:

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
look straightforward.

The first thing that we do is add an action to our `actions` array which tells commercetools to store
an interface interaction against this payment object. This interface interaction is a log of
something that occurred between our system and our chosen payment service provider (Worldpay). In this case
we're logging the original XML request along with any response from Worldpay. If, after this point
we realise that there's an error in the response, then we still have the details of the request and any
erroneous response, logged against the payment object in an interface interaction.

Assuming that there wasn't an error, then we continue to add a bunch of additional `actions` for commercetools
to process, including the setting of various custom fields, and adding an initial transaction to the payment
object.

## ApplePaySessionRequestHandler.js

The Apple Pay session handler begins a session for Apple Pay by communicating with Apple's servers. This communication requires TLS v1.2 with the help of a private key. That private key cannot be shared with customers, which is the reason this step in the payment process runs on the server.

### Resulting actions

There are two actions returned by this handler

1. The action telling commercetools to store the incoming payment data as an interface interaction
2. The action to update the payment object's `paymentData` attribute with the response from Apple, allowing the browser to start the Apple Pay session.
