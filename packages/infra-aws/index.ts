import * as cdk from '@aws-cdk/core'
import { WorldpayConnectorLambdaStack } from './lib/worldpayConnectorLambdaStack'
import { WorldpayConnectorDockerStack } from './lib/worldpayConnectorDockerStack'
import { WorldpayCertificateStack } from './lib/worldpayCertificateStack'

const app = new cdk.App()
const appName = app.node.tryGetContext('stackName')
const appStage = app.node.tryGetContext('stage')
const certificateStackNameWithStage = `worldpay-certificate-${appStage}`

const certificateStack = new WorldpayCertificateStack(app, certificateStackNameWithStage, {
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

const lambdaStackNameWithStage = `${appName}-lambda-${appStage}`
const lambdaConnectorStack = new WorldpayConnectorLambdaStack(app, lambdaStackNameWithStage, {
  env: {
    account: app.node.tryGetContext('account'),
    region: app.node.tryGetContext('region'),
  },
  description: `Worldpay Commercetools Connector Lambda Stack - ${appStage} stage`,
  stackName: lambdaStackNameWithStage,
  tags: {
    deployedBy: 'CDK',
    app: 'Worldpay Commercetools Connector',
    stage: appStage,
  },
})
lambdaConnectorStack.addDependency(certificateStack)

// const dockerStackNameWithStage = `${appName}-docker-${appStage}`
// const dockerConnectorStack = new WorldpayConnectorDockerStack(app, dockerStackNameWithStage, {
//   env: {
//     account: app.node.tryGetContext('account'),
//     region: app.node.tryGetContext('region')
//   },
//   description: `Worldpay Commercetools Connector Docker Stack - ${appStage} stage`,
//   stackName: dockerStackNameWithStage,
//   tags: {
//     'deployedBy': 'CDK',
//     'app': 'Worldpay Commercetools Connector',
//     'stage': appStage
//   }
// })
// dockerConnectorStack.addDependency(certificateStack)
