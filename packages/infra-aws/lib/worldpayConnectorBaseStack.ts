import * as cdk from '@aws-cdk/core';

export interface WorldpayConnectorStackProps extends cdk.StackProps {
  domain: string,
  extensionSubdomain: string,
  notificationSubdomain: string,
  name: string,
  region: string,
  stage: string,
  certificateId: string,
  secretNames: string,
  logRetentionDays: number,
  memorySizeinMb: number,
  timeoutInSecs: number,
  apiPath: string,
  reservedConcurrentExecutions: number,
  appPort: number,
  cpu: number,
  dockerImageName: string,
  desiredCount: number,
  healthCheckPath: string,
  maxAzs: number
}

export abstract class WorldpayConnectorBaseStack extends cdk.Stack {
  constructProps: WorldpayConnectorStackProps
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
    super(parent, name, props)

    const stage = this.node.tryGetContext('stage')
    let apiPath = this.node.tryGetContext('apiPath')
    apiPath = stage == 'prd' ? apiPath : `${apiPath}-${stage}`

    this.constructProps = {
      domain: this.node.tryGetContext('domain'),
      extensionSubdomain: this.node.tryGetContext('extensionSubdomain'),
      notificationSubdomain: this.node.tryGetContext('notificationSubdomain'),
      name: props.stackName || 'Worldpay Stack',
      region: this.node.tryGetContext('region'),
      stage: stage,
      certificateId: this.node.tryGetContext('certificateId'),
      secretNames: this.node.tryGetContext('secretNames'),
      logRetentionDays: this.node.tryGetContext('logRetentionDays'),
      memorySizeinMb: this.node.tryGetContext('memorySizeinMb'),
      reservedConcurrentExecutions: this.node.tryGetContext('reservedConcurrentExecutions'),
      timeoutInSecs: this.node.tryGetContext('timeoutInSecs'),
      apiPath: apiPath,
      appPort: this.node.tryGetContext('appPort'),
      cpu: this.node.tryGetContext('cpu'),
      dockerImageName: this.node.tryGetContext('dockerImageName'),
      desiredCount: this.node.tryGetContext('desiredCount'),
      healthCheckPath: this.node.tryGetContext('healthCheckPath'),
      maxAzs: this.node.tryGetContext('maxAzs')
    }

    this.buildConstructs()
  }

  abstract buildConstructs(): void
}
