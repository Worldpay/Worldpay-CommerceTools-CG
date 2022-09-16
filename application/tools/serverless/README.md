# `serverless-local`

This package is not intended to be consumed for production deployment, and is not a part of the mono-repo.

The main aim of this package is to provide a local serverless server that allows you
to run and debug the AWS Lambda functions found in the
[../../apps](../../apps) directory.

## Running and developing locally

### Setting up environment variables

Before you run the application, you need to have the correct environment variables setup. The easiest way to 
ensure that these are loaded when the application runs, is to copy the [`.env.template`](../../.env.template) 
file in the root `application` folder, and name it `.env`. This will be ignored by git, but will be read when 
the application starts up.

### Starting the local development server

We use `serverless` (and specifically the `serverless-offline` plugin) to power the local development server. 
The configuration can be seen in the `serverless.yml` file. This should not generally need editing unless 
you need to add additional routes and lambdas

**Important note:** the serverless framework is NOT used for deployment.

To start up the server, you can run:

```shell
pnpm start
```

The server will automatically reload any changed files. 

_NB: Alternatively, you run can `pnpm start:aws` in the application folder._

### Debugging

When you start the server using `pnpm start`, the debug server will automatically be started on port `9229`, 
and so you should immediately be able to start debugging using your IDE. Source maps are also enabled.
