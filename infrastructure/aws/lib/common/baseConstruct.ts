import * as cdk from 'aws-cdk-lib'
import * as apig from 'aws-cdk-lib/aws-apigateway'
import * as _ from 'lodash'
import { ConnectorStackProps } from './baseStack'
import { Construct } from 'constructs'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as certificateManager from 'aws-cdk-lib/aws-certificatemanager'

/**
 * CDK Stack base class for Notification and Extension modules.
 */
export abstract class BaseConstruct extends Construct {
  props: ConnectorStackProps
  fullyQualifiedDomainName: string
  id: string
  api: apig.RestApi
  hostedZone: route53.IHostedZone
  sslCertificate: certificateManager.ICertificate

  protected constructor(parent: Construct, id: string, props: ConnectorStackProps) {
    super(parent, id)
    this.props = props
    this.id = id

    this.determineFullyQualifiedDomain()
    this.resolveHostedZone()
    this.createCertificate()
    this.provisionResources()
  }

  protected resolveHostedZone() {
    this.hostedZone = route53.HostedZone.fromLookup(this, `${this.id}-hostedZone`, {
      domainName: this.fullyQualifiedDomainName,
    })
  }

  protected createCertificate() {
    const certificateArn = cdk.Fn.importValue(
      `${this.props.stackName}-${this.props.connectorCertificateStackName}-${this.props.stage}-certificateArn`,
    )
    this.sslCertificate = certificateManager.Certificate.fromCertificateArn(
      this,
      `${this.id}-certificate`,
      certificateArn,
    )
  }

  protected abstract provisionResources(): void

  protected determineFullyQualifiedDomain() {
    this.fullyQualifiedDomainName = this.props.subDomain
      ? `${this.props.subDomain}.${this.props.domainName}`
      : this.props.domainName
  }

  protected addOutput(id: string, value: string, description?: string, overrideId = true) {
    const camelName = _.camelCase(id)
    const output = new cdk.CfnOutput(this, id, {
      exportName: `${this.props.name}-${camelName}`,
      value,
      description,
    })
    if (overrideId) {
      output.overrideLogicalId(camelName)
    }
    return output
  }
}
