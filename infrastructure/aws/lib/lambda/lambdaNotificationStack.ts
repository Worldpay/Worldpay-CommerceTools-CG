import { BaseStack } from '../common/baseStack'
import { LambdaNotificationConstruct } from './lambdaNotificationConstruct'

export class LambdaNotificationStack extends BaseStack {
  buildConstructs(): void {
    // Create the notification construct - this is the Worldpay Notification endpoint that Worldpay
    // make API calls to. Secured via Mutual TLS
    new LambdaNotificationConstruct(
      this,
      `${this.props.stackName}-${this.props.connectorLambdaNotificationStackName}`,
      this.props,
    )
  }
}
