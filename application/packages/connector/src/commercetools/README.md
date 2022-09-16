# CommercetoolsClient class

The class is responsible for communication with Commercetools, for reading and writing:

* Customer
* Shopping cart
* Payment
* Payment transactions

There generally two patterns that use this package:


1. The payment extension 
   * Commercetools sends an event when the payment is created or updated
   * The payment processor is handed the event
     * It retrieves any additional data from commercetools (customer, cart, ...)
     * It sends information to Worldpay
     * It returns the actions that commercetools should execute, updating the payment, transactions, order, etc.
2. The notification
   * Worldpay sends a notification XML message
   * The notification processor is handed the event
     * It retrieves any additional data from commercetools (payment, customer, cart, ...)
     * It updates the payment, transactions, cart, etc. by invoking Commercetools APIs via this client
   * Convert the cart into an Order (if not already done by the Storefront)



