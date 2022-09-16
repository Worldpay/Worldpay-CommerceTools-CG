import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apig from 'aws-cdk-lib/aws-apigateway'
import * as s3 from 'aws-cdk-lib/aws-s3'
import { ConnectorStackProps } from '../common/baseStack'
import { LambdaBaseConstruct } from './lambdaBaseContruct'

import { Construct } from 'constructs'

/**
 * CDK Construct for the Worldpay Commercetools Connector Notification module.
 * This stack receives callback notifications from Worldpay via an API Gateway
 * endpoint secured with Mutual TLS using the Worldpay root certificate.
 */
export class LambdaNotificationConstruct extends LambdaBaseConstruct {
  certificateBucket: s3.IBucket
  mTLSConfig: apig.MTLSConfig
  lambdaFunction: lambda.Function

  constructor(parent: Construct, id: string, props: ConnectorStackProps) {
    super(parent, id, props)
  }

  protected provisionResources(): void {
    this.resolveCertificate()
    this.createLambda()
    this.createApi()
    this.createApiMappings()
  }

  private resolveCertificate() {
    // Retrieve the worldpay certificate bucket via CFN exported value.
    // The WorldpayCertificateStack should have already deployed that asset and set the param.
    const mutualTlsCertificateBucketName = cdk.Fn.importValue(
      `${this.props.stackName}-${this.props.connectorCertificateStackName}-${this.props.stage}-certificateBucketName`,
    )
    this.certificateBucket = s3.Bucket.fromBucketName(this, 'certificate-bucket', mutualTlsCertificateBucketName)
    this.mTLSConfig = <apig.MTLSConfig>{
      bucket: this.certificateBucket,
      key: 'worldpay-root-certificate.pem',
    }
  }

  private createLambda() {
    this.lambdaFunction = this.createLambdaFunction(
      `${this.id}-function`,
      new lambda.AssetCode('../../.artifacts/aws-lambda-notification'),
    )
  }

  private createApi() {
    this.api = this.createRestApi(`${this.id}-api`, this.lambdaFunction)
  }

  private createApiMappings() {
    this.createApiGatewayMappings(`${this.id}-api-mapping`, this.props.subDomain, this.sslCertificate, this.mTLSConfig)
  }
}
