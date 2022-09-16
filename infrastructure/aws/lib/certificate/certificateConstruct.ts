import * as cdk from 'aws-cdk-lib'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import { BaseConstruct } from '../common/baseConstruct'
import { ConnectorStackProps } from '../common/baseStack'
import { Construct } from 'constructs'
import * as certificateManager from 'aws-cdk-lib/aws-certificatemanager'

/**
 * Stack to deploy the Worldpay Root Certificate needed for
 * mutual TLS authentication. This needs to be deployed prior to the
 * connector stack, and the mTLS certificate S3 URL provided to it.
 */
export class CertificateConstruct extends BaseConstruct {
  certificateBucket: s3.IBucket

  constructor(parent: Construct, id: string, props: ConnectorStackProps) {
    super(parent, id, props)
  }

  protected provisionResources(): void {
    this.createCertificateBucket()
    this.deployCertificateBucket()
  }

  protected createCertificate() {
    this.sslCertificate = new certificateManager.Certificate(this, `${this.id}-certificate`, {
      domainName: this.fullyQualifiedDomainName,
      subjectAlternativeNames: [`*.${this.fullyQualifiedDomainName}`],
      validation: certificateManager.CertificateValidation.fromDns(this.hostedZone),
    })
    this.addOutput(`certificateArn`, this.sslCertificate.certificateArn)
  }

  protected createCertificateBucket() {
    this.certificateBucket = new s3.Bucket(this, `${this.id}-bucket`, {
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: true,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
    this.addOutput(`certificateBucketName`, this.certificateBucket.bucketName)
  }

  protected deployCertificateBucket() {
    new s3deploy.BucketDeployment(this, `${this.id}-bucket-deployment`, {
      sources: [s3deploy.Source.asset('resources/certificates/')],
      destinationBucket: this.certificateBucket,
      retainOnDelete: false,
      prune: true,
    })

    const certificateUrl = this.certificateBucket.s3UrlForObject('worldpay-root-certificate.pem')
    this.addOutput(`certificateUrl`, certificateUrl)
  }
}
