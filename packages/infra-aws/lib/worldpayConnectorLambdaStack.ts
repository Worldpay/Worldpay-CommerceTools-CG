import { WorldpayConnectorBaseStack, WorldpayConnectorStackProps } from './worldpayConnectorBaseStack';
import { WorldpayConnectorLambdaExtensionConstruct, WorldpayConnectorLambdaNotificationConstruct } from './worldpayConnectorLambdaConstruct'

export class WorldpayConnectorLambdaStack extends WorldpayConnectorBaseStack {
  buildConstructs(): void {
    // Create the extension construct - this is the API Extension that Commercetools interacts with
    // Secured via HTTP Auth + SSL
    new WorldpayConnectorLambdaExtensionConstruct(this, this.constructProps)

    // Create the notification construct - this is the Worldpay Notification endpoint that Worldpay
    // make API calls to. Secured via Mutual TLS
    new WorldpayConnectorLambdaNotificationConstruct(this, this.constructProps)
  }
}
