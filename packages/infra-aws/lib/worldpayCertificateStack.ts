import * as cdk from '@aws-cdk/core'
import * as s3 from '@aws-cdk/aws-s3'
import * as s3deploy from '@aws-cdk/aws-s3-deployment'

/**
 * Stack to deploy the Worldpay Root Certificate needed for
 * mutual TLS authentication. This needs to be deployed prior to the
 * connector stack, and the mTLS certificate S3 URL provided to it.
 */
export class WorldpayCertificateStack extends cdk.Stack {
  props: CertificateStackProps;

  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
    super(parent, name, props)

    this.props = {
      name: props.stackName || "worldpay-certificate",
      region: this.node.tryGetContext('region') || process.env.AWS_REGION,
      stage: this.node.tryGetContext('stage') || 'dev',
    }

    const certificateBucket = new s3.Bucket(this, 'worldpay-certificate-bucket', {
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    new s3deploy.BucketDeployment(this, 'worldpay-certificate-bucket-deployment', {
      sources: [s3deploy.Source.asset('resources/certificates/')],
      destinationBucket: certificateBucket,
      retainOnDelete: false,
      prune: true
    });

    const certificateUrl = certificateBucket.s3UrlForObject('worldpay-root-certificate.pem')
    this.addOutput('worldpayCertificateUrl', certificateUrl)
    this.addOutput('worldpayCertificateBucket', certificateBucket.bucketName)
  }

  addOutput(id: string, value: string, description?: string, overrideId: boolean = true) {
    const output = new cdk.CfnOutput(this, id, {
      exportName: `${this.props.name}-${id}`,
      value,
      description
    })
    if (overrideId) {
      output.overrideLogicalId(id)
    }
    return output
  }
}

export interface CertificateStackProps extends cdk.StackProps {
  name: string,
  region: string,
  stage: string,
}

