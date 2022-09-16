import * as cdk from 'aws-cdk-lib'
import { CertificateStack } from './lib/certificate/certificateStack'
import { LambdaNotificationStack } from './lib/lambda/lambdaNotificationStack'
import { LambdaExtensionStack } from './lib/lambda/lambdaExtensionStack'
import { SecretsStack } from './lib/secrets/secretsStack'

const app = new cdk.App()
const appName = app.node.tryGetContext('stackName')
const appNameCertificate = app.node.tryGetContext('connectorCertificateStackName')
const appNameLambdaExtension = app.node.tryGetContext('connectorLambdaExtensionStackName')
const appNameLambdaNotification = app.node.tryGetContext('connectorLambdaNotificationStackName')
const appNameSecrets = app.node.tryGetContext('connectorSecretsStackName')
const appStage = app.node.tryGetContext('stage')
const certificateStackNameWithStage = `${appName}-${appNameCertificate}-${appStage}`

const secretsStackNameWithStage = `${appName}-${appNameSecrets}-${appStage}`
const secretsStack = new SecretsStack(app, secretsStackNameWithStage, {
  env: {
    account: app.node.tryGetContext('account'),
    region: app.node.tryGetContext('region'),
  },
  description: `Worldpay Secrets Stack - ${appStage} stage`,
  stackName: secretsStackNameWithStage,
  tags: {
    deployedBy: 'CDK',
    app: 'Worldpay Commercetools Connector',
    stage: appStage,
  },
})

const certificateStack = new CertificateStack(app, certificateStackNameWithStage, {
  env: {
    account: app.node.tryGetContext('account'),
    region: app.node.tryGetContext('region'),
  },
  description: `Worldpay Certificate Stack - ${appStage} stage`,
  stackName: certificateStackNameWithStage,
  tags: {
    deployedBy: 'CDK',
    app: 'Worldpay Commercetools Connector',
    stage: appStage,
  },
})

const lambdaExtensionStackNameWithStage = `${appName}-${appNameLambdaExtension}-${appStage}`
const lambdaExtensionStack = new LambdaExtensionStack(app, lambdaExtensionStackNameWithStage, {
  env: {
    account: app.node.tryGetContext('account'),
    region: app.node.tryGetContext('region'),
  },
  description: `Worldpay Commercetools Connector Lambda Extension Stack - ${appStage} stage`,
  stackName: lambdaExtensionStackNameWithStage,
  tags: {
    deployedBy: 'CDK',
    app: 'Worldpay Commercetools Connector',
    stage: appStage,
  },
})
lambdaExtensionStack.addDependency(certificateStack)

const lambdaNotificationStackNameWithStage = `${appName}-${appNameLambdaNotification}-${appStage}`
const lambdaNotificationStack = new LambdaNotificationStack(app, lambdaNotificationStackNameWithStage, {
  env: {
    account: app.node.tryGetContext('account'),
    region: app.node.tryGetContext('region'),
  },
  description: `Worldpay Commercetools Connector Lambda Notification Stack - ${appStage} stage`,
  stackName: lambdaNotificationStackNameWithStage,
  tags: {
    deployedBy: 'CDK',
    app: 'Worldpay Commercetools Connector',
    stage: appStage,
  },
})
lambdaNotificationStack.addDependency(certificateStack)
