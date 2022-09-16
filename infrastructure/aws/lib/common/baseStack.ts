import * as cdk from 'aws-cdk-lib'

export interface CommercetoolsProps {
  region: string
  timeout: string
  authUrl: string
  apiUrl: string
}

export interface ConnectorStackProps extends cdk.StackProps {
  name: string
  region: string
  stage: string
  domainName: string
  subDomain: string
  logRetentionDays: number
  memorySizeinMb: number
  timeoutInSecs: number
  apiPath: string
  reservedConcurrentExecutions: number
  connectorLambdaExtensionStackName: string
  connectorLambdaNotificationStackName: string
  connectorCertificateStackName: string
  commercetools: CommercetoolsProps
  connectorSecretsStackName: string
  worldpaySecretName: string
  commercetoolsSecretName: string
  paymentCodePath: string
}

export abstract class BaseStack extends cdk.Stack {
  props: ConnectorStackProps
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
    super(parent, name, props)

    const stage = this.node.tryGetContext('stage')
    let apiPath = this.node.tryGetContext('apiPath')
    //apiPath = stage == 'prd' ? apiPath : `${apiPath}-${stage}`

    this.props = {
      connectorCertificateStackName: this.node.tryGetContext('connectorCertificateStackName'),
      connectorSecretsStackName: this.node.tryGetContext('connectorSecretsStackName'),
      connectorLambdaExtensionStackName: this.node.tryGetContext('connectorLambdaExtensionStackName'),
      connectorLambdaNotificationStackName: this.node.tryGetContext('connectorLambdaNotificationStackName'),
      stackName: this.node.tryGetContext('stackName'),
      domainName: this.node.tryGetContext('domainName'),
      subDomain: this.node.tryGetContext('subDomain'),
      name: props.stackName || 'worldpay-connector',
      region: this.node.tryGetContext('region'),
      stage: stage,
      logRetentionDays: this.node.tryGetContext('logRetentionDays'),
      memorySizeinMb: this.node.tryGetContext('memorySizeinMb'),
      timeoutInSecs: this.node.tryGetContext('timeoutInSecs'),
      reservedConcurrentExecutions: this.node.tryGetContext('reservedConcurrentExecutions'),
      apiPath: apiPath,
      commercetools: this.node.tryGetContext('commercetools'),
      worldpaySecretName: this.node.tryGetContext('worldpaySecretName'),
      commercetoolsSecretName: this.node.tryGetContext('commercetoolsSecretName'),
      paymentCodePath: this.node.tryGetContext('paymentCodePath'),
    }

    this.buildConstructs()
  }

  abstract buildConstructs(): void
}
