# Worldpay-commercetools Connector - User Guide

- [Configuring your environment](#configuring-your-environment)
- [Configuring your commercetools project](#configuring-your-commercetools-project)
- [Deploying to AWS Lambda](#deploying-to-aws-lambda)
- [Deploying as a Docker container](#deploying-as-a-docker-container)
- [Running and developing locally](#running-and-developing-locally)
- [Endpoints exposed](#endpoints-exposed)

## Configuring your environment

It's essential to have all required configuration params setup in order for the connector to run correctly.

### How do I provide configuration parameters?

The easiest way is to use environment variables. All of the existing
`entrypoint-*.js` files read from the `process.env` object when building up the configuration object.
Care should be taken to ensure that the environment variables provided to the node runtime are stored in a secure manner within your cloud infrastructure (i.e. within AWS SecretsManager or Azure KeyVault)

If running within AWS, you can set the value of a `SECRET_NAMES` environment variable to a comma separated list of AWS Secrets Manager secrets. These secrets will be read from SescretsManager and added to the node process environment variables. The key/value pairs for each of the secrets will be merged together. _NB: Ensure that the AWS resources have requisite IAM permissions to read these secrets_

### What happens if you don't define the required configuration?

If you try to use the connector without having setup the configuration parameters then you'll receive errors to this effect, and the server will not start up.

### What parameters are required?

#### Full list with descriptions

##### `WORLDPAY_EXTENSION_PORT`

The port that the server runs on (not required if using `entrypoint-aws-lambda.js`)

##### `WORLDPAY_EXTENSION_LOG_LEVEL`

Sets the logging level. Must be either `error`, `warn`, `info`, `http`, `verbose`, `debug` or `silly` - in increasing order of verbosity. Recommended to maintain `info` level when running in production.

##### `WORLDPAY_EXTENSION_ENDPOINT`

This is the URL that commercetools should call when a payment object is created. This is used by the
`CommercetoolsBootstrapper` class when creating the commercetools API extension.

##### `WORLDPAY_EXTENSION_BEARER_TOKEN`

This is the bearer token that'll be sent by commercetools when it calls our payment request processor.
This value is used by the `CommercetoolsBootstrapper` class when creating the API extension, and also
by the `HttpServer` class when checking that the incoming request is valid.

##### `WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT`

Determines whether to include FraudSight data in the payment request to Worldpay. The value should be
either `true` or `false`. FraudSight documentation: https://developer.worldpay.com/docs/wpg/fraudsightglobal/fraudsighthosted

##### `WORLDPAY_EXTENSION_API_BASE_PATH`

Only used with an AWS Lambda implementation. Defines the base path of the server. You may, for example, be using
API gateway to serve requests from `http://yourcompany.com/connector`. In this case, you would need to set
this variable to `/connector`

##### `WORLDPAY_MERCHANT_CODE`

Your Worldpay merchant code (you can find this within the Worldpay Merchant Admin Interface).

##### `WORLDPAY_INSTALLATION_ID`

Your Worldpay installation ID (you can find this within the Worldpay Merchant Admin Interface)

##### `WORLDPAY_XML_USERNAME`

Your Worldpay XML username (you can find/set this within the Worldpay Merchant Admin Interface)

##### `WORLDPAY_XML_PASSWORD`

Your Worldpay XML password (you can set this within the Worldpay Merchant Admin Interface)

##### `WORLDPAY_MAC_SECRET`

Your Worldpay MAC secret (you can set this within the Worldpay Merchant Admin Interface)

##### `WORLDPAY_REQUEST_TIMEOUT`

The duration (in milliseconds) to wait for a response from Worldpay after making a payment request.

##### `WORLDPAY_ENV`

This should be set to either `test` or `production`. It determines the Worldpay API URL which is used when making a payment request.

##### `CTP_PROJECT_KEY`

Your commercetools project key

##### `CTP_CLIENT_ID`

Your commercetools API client id

##### `CTP_CLIENT_SECRET`

Your commercetools API client secret

##### `CTP_API_URL`

Your commercetools API url

##### `CTP_AUTH_URL`

Your commercetools auth url

#### Example environment variables

```
export WORLDPAY_EXTENSION_PORT="3000"
export WORLDPAY_EXTENSION_LOG_LEVEL="silly"
export WORLDPAY_EXTENSION_ENDPOINT="https://api.worldpay.yourcompany.com/payment"
export WORLDPAY_EXTENSION_BEARER_TOKEN="ABC123"
export WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT="true"
export WORLDPAY_MERCHANT_CODE="YOURMERCHANTCODE"
export WORLDPAY_INSTALLATION_ID="1234567"
export WORLDPAY_XML_USERNAME="YOURXMLUSERNAME"
export WORLDPAY_XML_PASSWORD="YOURXMLPASSWORD"
export WORLDPAY_MAC_SECRET="yourmacsecret"
export WORLDPAY_ENV="test"
export CTP_PROJECT_KEY="your-project-key"
export CTP_CLIENT_SECRET="clientsecret"
export CTP_CLIENT_ID="clientid"
export CTP_API_URL="https://api.europe-west1.gcp.commercetools.com"
export CTP_AUTH_URL="https://auth.europe-west1.gcp.commercetools.com"
```

#### Example AWS Secrets Manager secret key/value pairs

What follows is an example plain text value for a single AWS Secrets Manager secret, allowing you to
quickly and easily copy, paste and edit the values:

```
{
   "WORLDPAY_EXTENSION_PORT": "3000",
   "WORLDPAY_EXTENSION_LOG_LEVEL": "silly",
   "WORLDPAY_EXTENSION_ENDPOINT": "https://api.worldpay.yourcompany.com/payment",
   "WORLDPAY_EXTENSION_BEARER_TOKEN": "ABC123",
   "WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT": "true",
   "WORLDPAY_MERCHANT_CODE": "YOURMERCHANTCODE",
   "WORLDPAY_INSTALLATION_ID": "1234567",
   "WORLDPAY_XML_USERNAME": "YOURXMLUSERNAME",
   "WORLDPAY_XML_PASSWORD": "YOURXMLPASSWORD",
   "WORLDPAY_MAC_SECRET": "yourmacsecret",
   "WORLDPAY_ENV": "test",
   "CTP_PROJECT_KEY": "your-project-key",
   "CTP_CLIENT_SECRET": "clientsecret",
   "CTP_CLIENT_ID": "clientid",
   "CTP_API_URL": "https://api.europe-west1.gcp.commercetools.com",
   "CTP_AUTH_URL": "https://auth.europe-west1.gcp.commercetools.com"
}
```

Let's say that you saved the above in a secret with a name of `worldpay-connector`. You would then
need to set the value of the `SECRET_NAMES` environment variable to `worldpay-connector`.

If you wanted to split these values across multiple AWS Secrets Manager secrets, then the value of
the `SECRET_NAMES` environment variable would be a comma separated list of all the secret names that
you want to use.

## Configuring your commercetools project

There is one API extension and 3 custom types that need to be created in your commercetools project as
a prerequisite for the use of this connector. These items can be easily created by running the following command from the `/packages/connector` directory:

```
npm run bootstrap
```

If for any reason you want to delete and re-create the API extension and types, you can run the following command:

```
npm run bootstrap --force
```

Note however, that if you have any existing payment objects, this process will fail as it will be unable to remove the `worldpay-payment` type that's associated with the payment resource type. The solution here, assuming that you're wanting to alter the `worldpay-payment` type for example, is to alter the existing type rather than deleting and re-creating it. This can be done using update actions:
https://docs.commercetools.com/api/projects/types#update-type-by-key

## Deploying to AWS Lambda

## Deploying as a Docker container

## Running and developing locally

Detailed developer documentation can be found in the [Developer Guide](./DEVELOPER_GUIDE.md).

## Endpoints exposed

By default, the connector expects the commercetools payment API extension requests to be directed to
the base url of your server. The Worldpay notifications are expected to be directed at the
`/notifications` path off the base url.

Let's say you start up the local server which will run on `http://localhost:3000`. The default endpoint
for processing incoming commercetools payment API extension requests will be `http://localhost:3000`
(i.e. the same as the server base url). For Worldpay notifications, the endpoint will be
`http://localhost:3000/notifications`.

For AWS Lambda implementations, you can use the `WORLDPAY_EXTENSION_API_BASE_PATH` config variable to
define a specific path from which the lambda is called. For example, if you have API Gateway setup to
serve requests from `https://yourcompany.com/connector`, then `WORLDPAY_EXTENSION_API_BASE_PATH` will
need to be set to `/connector`.

### Configuring endpoint URLs within Worldpay Merchant Admin Interface

The endpoint URLs that the connector exposes must be configured within the Worldpay Merchant Admin Interface (MAI) using the `http` Merchant Channel for both test and production.
Full details of this configuration step are available within the Worldpay docs: https://developer.worldpay.com/docs/wpg/manage
