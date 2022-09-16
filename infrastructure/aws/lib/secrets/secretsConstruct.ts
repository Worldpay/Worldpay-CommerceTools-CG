import * as cdk from 'aws-cdk-lib'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import { BaseConstruct } from '../common/baseConstruct'
import { ConnectorStackProps } from '../common/baseStack'
import { Construct } from 'constructs'

/**
 * Stack to deploy the Worldpay Root Certificate needed for
 * mutual TLS authentication. This needs to be deployed prior to the
 * connector stack, and the mTLS certificate S3 URL provided to it.
 */
export class SecretsConstruct extends BaseConstruct {
  constructor(parent: Construct, id: string, props: ConnectorStackProps) {
    super(parent, id, props)
  }

  protected provisionResources(): void {
    this.createSecrets()
  }

  protected createSecrets() {
    const secretNames = [this.props.worldpaySecretName, this.props.commercetoolsSecretName]

    for (var secretName of secretNames) {
      new secretsmanager.Secret(this, secretName, {
        secretName: `${this.props.stackName}-${secretName}-${this.props.stage}`,
      })
    }
  }
}
