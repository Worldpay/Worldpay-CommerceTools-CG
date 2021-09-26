# Creating a Server

This documentation mainly talks about the code found in the `createServer.js` file that you'll find at the same
level as this markdown file.

Take a quick look at the source for `createServer.js`. It's fairly straightforward.

## What does the `createServer.js` file export?

An anonymous function. This is then executed by any code wishing to get a pre-configured instance of the
`HttpServer` class found in`lib/httpserver/HttpServer.js`.

## Should I only call the exported function once?

Yes. While you theoretically could call the function multiple times, it'd then try and create multiple servers
running on the same port, which would result in an error being thrown.

## What's the point of the function?

Mainly as a way of sharing common code between the different `endpoint-*.js` files.

## What's the function actually doing?

Ultimately, it's creating an instance of the `HttpServer` class, and returning this to the user. More details
on the `HttpServer` class can be found in the [HttpServer documentation](./lib/httpserver/README.md).

The function takes care of the setting up of the parameters that are passed in to the `HttpServer` constructor.
This involves instantiating 3 classes:

- `CommercetoolsClient` - takes care of the communication with your commercetools project
- `PaymentProcessor` - powers the commercetools payment API extension
- `NotificationsProcessor` - handles incoming notifications from Worldpay

You'll notice that each of these classes is passed pieces of the `config` parameter that's passed in to the
exported function.

Also worth noting is that the instances of these 3 classes are stored in the `createServer.js` module. They are
therefore long-lived variables, and are designed to not need to be instantiated per request.

## How do the `endpoint-*.js` files use the exported server?

Under the hood, the `HttpServer` class sets up an [expressjs](https://expressjs.com/) app.

The simplest use of the class can be seen in the `entrypoint-local.js` file where you'll see the following line
of code:

```
server.start()
```

This starts a server listening on whatever port you've configured (see the [User Guide](../../docs/USER_GUIDE.md)
for config setup details).

If you're using AWS Lambda, you'll be using the `entrypoint-aws-lambda.js` file.
