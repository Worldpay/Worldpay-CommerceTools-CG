import { BaseStack } from '../common/baseStack'
import { LambdaExtensionConstruct } from './lambdaExtensionConstruct'

export class LambdaExtensionStack extends BaseStack {
  buildConstructs(): void {
    // Create the extension construct - this is the API Extension that Commercetools interacts with
    // Secured via HTTP Auth + SSL
    new LambdaExtensionConstruct(
      this,
      `${this.props.stackName}-${this.props.connectorLambdaExtensionStackName}`,
      this.props,
    )
  }
}
