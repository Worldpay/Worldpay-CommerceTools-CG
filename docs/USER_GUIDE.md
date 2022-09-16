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

If running within AWS, you can set the value of a `SECRET_NAMES` environment variable to a comma separated list of AWS Secrets Manager secrets. These secrets will be read from SecretsManager and added to the node process environment variables. The key/value pairs for each of the secrets will be merged together.

_NB: Ensure that the AWS resources have requisite IAM permissions to read these secrets_

### What happens if you don't define the required configuration?

If you try to use the connector without having setup the configuration parameters then you'll receive errors to this effect, and the server will not start up.

### What parameters are required?

#### Full list with descriptions


##### `WORLDPAY_CONNECTOR_LOG_LEVEL`

Sets the logging level. Must be either `error`, `warn`, `info`, `http`, `verbose`, `debug` or `silly` - in increasing order of verbosity. Recommended to maintain `info` level when running in production.

##### `WORLDPAY_CONNECTOR_INCLUDE_FRAUDSIGHT`

Determines whether to include FraudSight data in the payment request to Worldpay. The value should be
either `true` or `false`. See also the [Worldpay FraudSight documentation](https://developer.worldpay.com/docs/wpg/fraudsightglobal/fraudsighthosted).

##### `WORLDPAY_CONNECTOR_MERCHANT_CODE`

Your Worldpay merchant code (you can find this within the Worldpay Merchant Admin Interface).

##### `WORLDPAY_CONNECTOR_INSTALLATION_ID`

Your Worldpay installation ID (you can find this within the Worldpay Merchant Admin Interface)

##### `WORLDPAY_CONNECTOR_XML_USERNAME`

Your Worldpay XML username (you can find/set this within the Worldpay Merchant Admin Interface)

##### `WORLDPAY_CONNECTOR_XML_PASSWORD`

Your Worldpay XML password (you will need to adjust this within the Worldpay Merchant Admin Interface)

##### `WORLDPAY_CONNECTOR_MAC_SECRET`

Your Worldpay MAC secret (you can set this within the Worldpay Merchant Admin Interface)

##### `WORLDPAY_CONNECTOR_REQUEST_TIMEOUT`

The duration (in milliseconds) to wait for a response from Worldpay after making a payment request.

##### `WORLDPAY_CONNECTOR_ENV`

This should be set to either `test` or `production`. It determines the Worldpay API URL which is used when making a payment request.

##### `WORLDPAY_CONNECTOR_CAPTURE_DELAY`

The delay between payment authorisation and capture, will cause the automatic capture of the payment to be delayed with set value in days.
See [Worldpay Capture Delay](https://developer.worldpay.com/docs/wpg/directintegration/paymentrequests) for more details

##### `WORLDPAY_CONNECTOR_ENABLE_EXEMPTION_ENGINE`

Value `true` enables the exemption engine, with type/placement as defined in the next two variables. Any other value disables it.

##### `WORLDPAY_CONNECTOR_EXEMPTION_TYPE`

The exemption type for the exemption engine.

##### `WORLDPAY_CONNECTOR_EXEMPTION_PLACEMENT`

The exemption placement for the exemption engine.

##### `WORLDPAY_CONNECTOR_ENABLE_TOKENISATION`

Value `true` will request for tokenisation of a credit / debit card if the customer chooses this on the Hosted Payment Page. 

##### `WORLDPAY_CONNECTOR_MERCHANT_NAME`

The name of your store, i.e. "Sunrise Worldpay Shop"

##### `WORLDPAY_CONNECTOR_RETURN_URL`

The URL where the customer returns after a successful, failed, canceled or failed payment. The URL will include a `status` parameter with value `success`, `failure`, `cancel` or `pending`. Do not add the `?`. Example: `https://www.myshop.com/checkout`.

##### `WORLDPAY_CONNECTOR_TERMS_URL`

The Terms & Conditions URL of your shop, used for Klarna.

##### `WORLDPAY_CONNECTOR_CTP_PROJECT_KEY`

Your commercetools project key

##### `WORLDPAY_CONNECTOR_CTP_CLIENT_ID`

Your commercetools API client id

##### `WORLDPAY_CONNECTOR_CTP_CLIENT_SECRET`

Your commercetools API client secret

##### `WORLDPAY_CONNECTOR_CTP_API_URL`

Your commercetools API url

##### `WORLDPAY_CONNECTOR_CTP_AUTH_URL`

Your commercetools auth url

##### `WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_DOMAIN`

The Apple Pay merchant domain which you have registered with Apple (i.e. www.myshop.com)

##### `WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_ID`

The Apple Pay merchant ID that you registered at Apple

##### `WORLDPAY_CONNECTOR_SPACES_IN_PAYPAL_DESCRIPTION'

Boolean to allow / prevent spaces in the Paypal description field. Spaces can cause a mangled URL to be returned, where spaces are not properly HTML encoded. To prevent broken paypal returnURL responses, set this flag to `false`. Spaces will be replaced by '-' in the description field. 

#### Local development

For local development and debugging it is possible to start up the lambda on a local development environment, in which an additional variable is required:

#### `SERVERLESS_SERVER_PORT`

The port number where the local function is available under 

http://localhost:*port*/notification or http://localhost:*port*/payment

#### `WORLDPAY_CONNECTOR_MAP_STATE_TO_ISO_3611_2`

If set to `true`, the address state attribute for billing and shipping address will be converted into 2-character ISO-3611-2 state codes by looking them up in a table.
For instance `Alabama` will be converted into `AL` and `上海市` will become `SH`. Also passing in `US-AL` will become `AL`. 
For non-US and non-China countries, state will be passed as-is.

When set to `false`, US and Chinese states will be kept as-is, and it is the responsibility of the storefront to provide the correct ISO-3622-2 state codes (2 characters). Note that non-valid state codes may lead to problems. 

#### Example environment variables

```
WORLDPAY_CONNECTOR_MERCHANT_CODE=YOURMERCHANTCODE
WORLDPAY_CONNECTOR_INSTALLATION_ID=1234567
WORLDPAY_CONNECTOR_XML_USERNAME=YOURXMLUSERNAME
WORLDPAY_CONNECTOR_XML_PASSWORD=YOURXMLPASSWORD
WORLDPAY_CONNECTOR_MAC_SECRET=123
WORLDPAY_CONNECTOR_ENV=test
WORLDPAY_CONNECTOR_CAPTURE_DELAY=0
WORLDPAY_CONNECTOR_MERCHANT_NAME=Sunrise Worldpay Shop
WORLDPAY_CONNECTOR_TERMS_URL=https://www.myshop.com/terms-and-conditions.html
WORLDPAY_CONNECTOR_RETURN_URL=https://www.myshop.com/checkout/payment/complete.html
WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_DOMAIN=your-applepay-merchant-domain
WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_ID=applepay.merchant.id
WORLDPAY_CONNECTOR_CTP_API_URL=https://api.europe-west1.gcp.commercetools.com
WORLDPAY_CONNECTOR_CTP_AUTH_URL=https://auth.europe-west1.gcp.commercetools.com
WORLDPAY_CONNECTOR_CTP_CLIENT_ID=clientid
WORLDPAY_CONNECTOR_CTP_CLIENT_SECRET=clientsecret
WORLDPAY_CONNECTOR_CTP_PROJECT_KEY=your-project-key
WORLDPAY_CONNECTOR_INCLUDE_FRAUDSIGHT=true
WORLDPAY_CONNECTOR_ENABLE_TOKENISATION=true
WORLDPAY_CONNECTOR_ENABLE_EXEMPTION_ENGINE=true
WORLDPAY_CONNECTOR_EXEMPTION_TYPE=OP
WORLDPAY_CONNECTOR_EXEMPTION_PLACEMENT=OPTIMISED
WORLDPAY_CONNECTOR_REQUEST_TIMEOUT=5000
WORLDPAY_CONNECTOR_LOG_LEVEL=debug

# For local start only
SERVERLESS_SERVER_PORT=5000
```

#### Example AWS Secrets Manager secret key/value pairs

What follows is an example plain text value for a single AWS Secrets Manager secret, allowing you to
quickly and easily copy, paste and edit the values:

```
{
    "WORLDPAY_CONNECTOR_MERCHANT_CODE": "YOURMERCHANTCODE",
    "WORLDPAY_CONNECTOR_INSTALLATION_ID": "1234567",
    "WORLDPAY_CONNECTOR_XML_USERNAME": "YOURXMLUSERNAME",
    "WORLDPAY_CONNECTOR_XML_PASSWORD": "YOURXMLPASSWORD",
    "WORLDPAY_CONNECTOR_MAC_SECRET": "123",
    "WORLDPAY_CONNECTOR_ENV": "test",
    "WORLDPAY_CONNECTOR_CAPTURE_DELAY": "0",
    "WORLDPAY_CONNECTOR_MERCHANT_NAME": "Sunrise Worldpay Shop",
    "WORLDPAY_CONNECTOR_TERMS_URL": "https://www.myshop.com/terms-and-conditions.html",
    "WORLDPAY_CONNECTOR_RETURN_URL": "https://www.myshop.com/checkout/payment/complete.html",
    "WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_DOMAIN": "your-applepay-merchant-domain",
    "WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_ID": "applepay.merchant.id",
    "WORLDPAY_CONNECTOR_CTP_API_URL": "https://api.europe-west1.gcp.commercetools.com",
    "WORLDPAY_CONNECTOR_CTP_AUTH_URL": "https://auth.europe-west1.gcp.commercetools.com",
    "WORLDPAY_CONNECTOR_CTP_CLIENT_ID": "clientid",
    "WORLDPAY_CONNECTOR_CTP_CLIENT_SECRET": "clientsecret",
    "WORLDPAY_CONNECTOR_CTP_PROJECT_KEY": "your-project-key",
    "WORLDPAY_CONNECTOR_INCLUDE_FRAUDSIGHT": "true",
    "WORLDPAY_CONNECTOR_ENABLE_TOKENISATION": "true",
    "WORLDPAY_CONNECTOR_ENABLE_EXEMPTION_ENGINE": "true",
    "WORLDPAY_CONNECTOR_EXEMPTION_TYPE": "OP",
    "WORLDPAY_CONNECTOR_EXEMPTION_PLACEMENT": "OPTIMISED",
    "WORLDPAY_CONNECTOR_REQUEST_TIMEOUT": "5000",
    "WORLDPAY_CONNECTOR_LOG_LEVEL": "debug"
}
```

Let's say that you saved the above in a secret with a name of `worldpay-connector`. You would then
need to set the value of the `SECRET_NAMES` environment variable to `worldpay-connector`.

If you wanted to split these values across multiple AWS Secrets Manager secrets, then the value of
the `SECRET_NAMES` environment variable would be a comma separated list of all the secret names that
you want to use.

## Configuring your commercetools project

Before the connector can be used, commercetools configuration and deployment of the connector into the cloud is required. Detail on this can be found in the [Developer Guide](./DEVELOPER_GUIDE.md).

## Endpoints exposed

By default, the connector expects the commercetools payment API extension requests to be directed to
`/payments` path from the base url of your server. The Worldpay notifications are expected to be directed at the
`/notifications` path off the base url.

Let's say you start up the local server which will run on `http://localhost:3000`. The default endpoint
for processing incoming commercetools payment API extension requests will be `http://localhost:3000/payments`
(i.e. the same as the server base url). For Worldpay notifications, the endpoint will be
`http://localhost:3000/notifications`.

### Configuring endpoint URLs within Worldpay Merchant Admin Interface

The endpoint URLs that the connector exposes must be configured within the Worldpay Merchant Admin Interface (MAI) using the `http` Merchant Channel for both test and production.
Full details of this configuration step are available within the Worldpay docs: https://developer.worldpay.com/docs/wpg/manage

## End-2-end tests

The connector comes with a number of end-2-end tests that verify the functionality in a live environment. See [End-2-End tests](./END-TO-END-TESTS.md) for details.