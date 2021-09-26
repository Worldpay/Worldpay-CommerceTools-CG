import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as apig from '@aws-cdk/aws-apigateway'
import * as route53 from '@aws-cdk/aws-route53'
import * as route53Target from '@aws-cdk/aws-route53-targets'
import * as certificateManager from '@aws-cdk/aws-certificatemanager'
import * as _ from 'lodash'
import { WorldpayConnectorStackProps } from './worldpayConnectorBaseStack'

/**
 * CDK Stack base class for Notification and Extension modules.
 */
export abstract class WorldpayConnectorBaseConstruct extends cdk.Construct {
  hostedZone: route53.IHostedZone
  sslCertificate: certificateManager.ICertificate
  props: WorldpayConnectorStackProps
  api: apig.RestApi

  constructor(parent: cdk.Construct, id: string, props: WorldpayConnectorStackProps) {
    super(parent, id)

    this.props = props

    this.hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: props.domain
    })

    const certificateArn = `arn:aws:acm:${props.region}:${cdk.Stack.of(this).account}:certificate/${props.certificateId}`
    this.sslCertificate = certificateManager.Certificate.fromCertificateArn(this, 'Certificate', certificateArn)
  }

  createApiGatewayMappings(id: string, subdomain: string, sslCertificate: certificateManager.ICertificate, mtlsConfig?: apig.MTLSConfig) {

    const fullDomainName = `${subdomain}.${this.props.domain}`

    // Mappings for extension/notification with optional mTLS support
    const customDomain = new apig.DomainName(this, `${id}CustomDomain`, {
      domainName: fullDomainName,
      certificate: sslCertificate,
      endpointType: apig.EndpointType.REGIONAL,
      securityPolicy: apig.SecurityPolicy.TLS_1_2,
      mtls: mtlsConfig
    })

    new apig.BasePathMapping(this, `${id}APIBasePathMapping`, {
      basePath: this.props.apiPath,
      domainName: customDomain,
      restApi: this.api,
      stage: this.api.deploymentStage
    })

    new route53.ARecord(this, `${id}CustomDomainARecord`, {
      recordName: subdomain,
      target: route53.RecordTarget.fromAlias(new route53Target.ApiGatewayDomain(customDomain)),
      zone: this.hostedZone
    })
  }

  // Create IAM SecretsManager policy statement allowing read of all configured named secrets
  createSecretsPolicyStatement() {
    const secretNames = this.props.secretNames.split(',').map((secretName) => secretName.trim())
    const secretArns = secretNames.map(
      (secretName) =>
        `arn:aws:secretsmanager:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account
        }:secret:${secretName}-??????`
    )
    const secretsStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: secretArns
    })
    return secretsStatement
  }

  addOutput(id: string, value: string, description?: string, overrideId: boolean = true) {
    const camelName = _.camelCase(id)
    const output = new cdk.CfnOutput(this, id, {
      exportName: `${this.props.name}-${camelName}`,
      value,
      description
    })
    if (overrideId) {
      output.overrideLogicalId(camelName)
    }
    return output
  }
}

