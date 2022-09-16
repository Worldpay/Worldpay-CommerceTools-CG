# End-2-end tests

With the use of the [Cypress](https://www.cypress.io) framework a deployed connector can be integration tested.
To run the tests in [the e2e folder](../application/packages/connector/__tests__/e2e) it is possible to issue the command:

```shell
cd application
pnpm e2etest:all 
```

## Preparation

To run the tests, a number of environment variables are required, which share their names and meaning with the ones described in the [User Guide](./USER_GUIDE.md).
One significant detail to pay attention to: **the commercetools token requires `view_payments` scope, so it can read additional payment attributes after a customer paid for an order.**

The only additional variable required, compared to the regular connector environment, is `WORLDPAY_CONNECTOR_E2E_TEST_TIMEOUT_MINS`, which defines the maximum time a test waits for completion.
With unit **minutes** we allow long running tests, which is required for the notifications (see below).

## Tests

### Developing tests

When developing or changing tests, you can bring up the Cypress interactive dialog, via:

```shell
cd application/packages/connector
pnpm e2etest:interact
```

As documented in the Cypress manuals, it is possible to isolate a single test, by post-fixing it with `it.only('test description') ...`.

### Payment tests

The tests will set up a shopping cart, add a payment, and then request the full payment details (for which the `view_payments` scope is required) to verify if all details are as expected.
If so, the browser is redirected to the URL provided in the response, and the dialog that is displayed is used to proceed with the payment (either hosted, or in the simulator in case of a direct payment method like Klarna, Paypal or iDEAL).

### Notification tests

Notification is a somewhat tricky to test, as the flow is:

1. Create a cart
2. Pay for the cart using a hosted payment method
3. Convert the cart to an order
4. Wait for the notifications to complete, including the capture of the payment amount
   1. Because the capture is configured to be `0`, meaning no days in between authorisation and payment, it should happen 'soon'. The time before the capture does arrive, varies from a few to up to 30 minutes.
   2. During this time, the test retries to fetch all interactions and check for the capture notification to be present.

The default time the notification tests run is 30 minutes, but that may be insufficient in some cases. Set variable `WORLDPAY_CONNECTOR_E2E_TEST_TIMEOUT_MINS` to a longer time if so.