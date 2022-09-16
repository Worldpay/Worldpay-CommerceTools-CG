import { BaseStack } from '../common/baseStack'
import { CertificateConstruct } from './certificateConstruct'

/**
 * Stack to deploy the Worldpay Root Certificate needed for
 * mutual TLS authentication. This needs to be deployed prior to the
 * connector stack, and the mTLS certificate S3 URL provided to it.
 */
export class CertificateStack extends BaseStack {
  buildConstructs(): void {
    new CertificateConstruct(this, `${this.props.stackName}-${this.props.connectorCertificateStackName}`, this.props)
  }
}
