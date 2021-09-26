# Worldpay commercetools connector - connector package

## Package overview

This package contains the code that's executed in response to either a request from commercetools via the
Worldpay connector extension, or when a notification request comes in from Worldpay.

## Configuration

There are a number of configuration parameters required in order to run the connector. Please see the
[Configuration](lib/config/README.md) documentation for details on what's required.

## What are the different entry points?

By 'entry points', we're referring to files which are executed in order to run the code, either for a specific
request in the case of a serverless function, or to initialise a server for long-running processes such as a
Docker container or EC2 instance.

There are 3 entrypoint files, all with a name in the format `entrypoint-*.js`:

- `entrypoint-local.js` - this file starts up a server used for local development, though could theoretically
  be used on a long-running virtual machine. It's the most straightforward implementation and a useful starting point.
- `entrypoint-aws-lambda.js` - this file exports a handler function for use as an AWS Lambda function.
  Configuration parameters from environment variables are merged with those retrieved from AWS Secrets Manager.
- entrypoint-aws-docker.js - intended to be the ENTRYPOINT in a Dockerfile, this code is very similar to the
  `entrypoint-local.js` except that as with the `entrypoint-aws-lambda.js` file, the configuration parameters from
  environment variables are merged with those retrieved from AWS Secrets Manager

## npm commands

You would not generally be expected to execute any of the npm command found in the `package.json` file unless
you are customising the implementation. The command list is very straightforward:

```
"scripts": {
    "test": "jest --silent",
    "start": "node entrypoint-local.js",
    "bootstrap": "node bootstrap.js"
}
```

### npm test

This will execute Jest (https://jestjs.io/) using the `jest.config.js` file found in the root of this package,
which will ultimately run the unit and integration tests found in the `__tests__` folder. We highly recommend
expanding on the existing tests if making your own customisations.

### npm run start

This will run the `entrypoint-local.js` file which will start up a long-lived server process based on the
[configuration parameters](lib/config/README.md) passed in.

### npm run bootstrap

This task will create the commercetools API extension and types as defined in the `resources/commercetools` folder.
The connection to commercetools needs to be defined via the connector [configuration](lib/config/README.md).

## Technical deep dive

There are a number of key technical concepts that are useful to understand in order get a more comprehensive
view of the technical implementation. See the links below for separate document on each appropriate area:

- [Creating a server](./SERVER.md) - a closer look at the `createServer.js` file
- [HttpServer](./lib/HttpServer/README.md) - the class that is ultimately responsible for the running of the
  server and handling of requests
- [PaymentProcessor](./lib/processor/payment/README.md) - the class responsible for handling requests from
  our commercetools API extension
- [NotificationProcessor](./lib/processor/notification/README.md) - the class responsible for handling notification
  requests sent from Worldpay
- [CommercetoolsBootstrapper](./lib/commercetools/README.md) - a closer look at how the bootstrapping process works
