# CommercetoolsBootstrapper class

Currently, this class is used by the `bootstrap.js` file through the running of the `npm run bootstrap` task
on the command line.

The class is responsible for th creation (or re-creation) of two things within your commercetools project:

- An API extension (https://docs.commercetools.com/api/projects/api-extensions)
- 3 sets of custom types (https://docs.commercetools.com/api/projects/types)

The JSON representation of the API extension and the 3 custom types can be found in the
`packages/connector/resources` folder. The JSON files within the `types` folder are applied 'as-is' to
the commercetools project, whereas the API extension defined in the `api-extension` folder is manipulated
slightly before being sent to the commercetools server. Specifically, we set the value of the `url` property
to the value of the endpoint of your payment extension. This can be seen in the `createApiExtension` method:

```javascript
definition.destination.url = this.extensionEndpoint
definition.destination.authentication.headerValue = `Bearer ${this.bearerToken}`
return this.client.createApiExtension(definition)
```

The `bearerToken` and the `extensionEndpoint` are both properties passed in on the `options` argument
of the `CommercetoolsBootstrapper` constructor.

## Re-creating the pre-existing API extension and types

By default, when you execute `npm run bootstrap`, the `CommercetoolsBootstrapper` class will check to see if
the API extension and the custom types that we need, have already been created. If they have, then the class
won't attempt to re-create them. If you want to force the deletion of any pre-existing API extension or custom
types then you run `npm run bootstrap --force`.

Please note that you'll receive an error relating to the deletion of the `worldpay-payment` custom type if you
have payment objects created in your project that already have the `worldpay-payment` custom type associated
with them. If you want to be able to delete an existing `worldpay-payment`, you need to ensure that no payment
objects exist in your system that are using that type.
