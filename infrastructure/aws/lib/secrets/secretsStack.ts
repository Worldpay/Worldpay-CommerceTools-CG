import { BaseStack } from '../common/baseStack'
import { SecretsConstruct } from './secretsConstruct'

/**
 * Stack to deploy the Worldpay Root Certificate needed for
 * mutual TLS authentication. This needs to be deployed prior to the
 * connector stack, and the mTLS certificate S3 URL provided to it.
 */
export class SecretsStack extends BaseStack {
  buildConstructs(): void {
    new SecretsConstruct(this, `${this.props.stackName}-${this.props.connectorSecretsStackName}`, this.props)
  }
}
