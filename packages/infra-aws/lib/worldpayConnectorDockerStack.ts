import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import { WorldpayConnectorBaseStack } from './worldpayConnectorBaseStack';
import { WorldpayConnectorDockerExtensionConstruct, WorldpayConnectorDockerNotificationConstruct } from './worldpayConnectorDockerConstruct'

export class WorldpayConnectorDockerStack extends WorldpayConnectorBaseStack {
  buildConstructs(): void {

    // Create constructs shared across botht the notification and extension constructs
    const vpc = new ec2.Vpc(this, `${this.constructProps.name}Vpc`, {
      maxAzs: this.constructProps.maxAzs
    })

    const cluster = new ecs.Cluster(this, `${this.constructProps.name}EcsCluster`, {
      clusterName: this.constructProps.name,
      vpc: vpc
    })

    // add a -docker extension to the API paths - THIS IS FOR TESTING PURPOSES ONLY
    this.constructProps.extensionSubdomain = this.constructProps.extensionSubdomain + '-docker'
    this.constructProps.notificationSubdomain = this.constructProps.notificationSubdomain + '-docker'

    // Create the extension construct - this is the API Extension that Commercetools interacts with
    // Secured via HTTP Auth + SSL
    new WorldpayConnectorDockerExtensionConstruct(this, this.constructProps, vpc, cluster)

    // Create the notification construct - this is the Worldpay Notification endpoint that Worldpay
    // make API calls to. Secured via Mutual TLS
    new WorldpayConnectorDockerNotificationConstruct(this, this.constructProps, vpc, cluster)
  }
}
