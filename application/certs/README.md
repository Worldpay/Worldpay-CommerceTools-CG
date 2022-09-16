# Certificates

This folder should contain the certificates for Apple Pay.

Generate the certificates (see [Worldpay's Apple Pay documentation](https://developer.worldpay.com/docs/wpg/mobilewallets/applepay) and [Apple Developer Documentation](https://developer.apple.com/documentation/apple_pay_on_the_web/configuring_your_environment#3179109) for details)

  * Apple Pay certificate
  * Merchant certificate
  * Merchant private key

On MacOS, you can import the certificates into the KeyChain application by double-clicking them in the Finder.

## Preparing the keys for the payment extension

When starting a payment session, communication with the Apple Pay servers is required. This traffic requires TLS v1.2 encryption with a client certificate.
Because the connection uses a private key, it should never be initiated from the browser. Instead we use the payment extension to initiate the session.
We cannot invoke the payment extension directly from the browser, therefore the session initiation creates a `payment` object in commercetools. The `Create` event
resulting from that reaches the payment extension, which will securely communicate with Apple to initiate the session.

The payment extension requires the keys to be in ASCII format (PEM files). Therefore, a number of steps are required to convert the available keys:

* Convert apple_pay.cer into pem:
  * `openssl x509 -inform der -in apple_pay.cer -out apple_pay.pem`
* Convert merchant_id.cer into pem:
  * `openssl x509 -inform der -in merchant_id.cer -out merchant_id.pem`
* Export .p12 file from KeyChain (merchant.p12), which will hold both the certificate and the private key
  * You will be asked for a password to protect the private key in this file
  * Extract the private key: `openssl pkcs12 -in ~/Downloads/merchant.p12 -out merchant.key`
  * You will be asked for the password given previously, and have to create a password to protect the private key
  * Decrypt the private key: `openssl rsa -in merchant.key -out merchant.key.decrypted`
  * The decrypted private key will be used to sign the TLS v1.2 session with the Apple Pay servers

Once available, save the keys in this folder, so the payment extension can read them.

_NB: never commit the private key into version control, as it provides the security related to payments. Instead make it available in your cloud environment via_
a key vault or secret manager available from your cloud vendor. Access should be restricted to a known, limited group of people.

## Testing locally

When testing the lambda service on local development machines, the certificates need to be placed in a folder `application/tools/serverless/certs`.

