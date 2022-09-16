import * as iam from 'aws-cdk-lib/aws-iam'
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as cdk from 'aws-cdk-lib'
import { ConnectorStackProps } from '../common/baseStack'
import { Construct } from 'constructs'
import { LambdaBaseConstruct } from './lambdaBaseContruct'

/**
 * CDK Construct for the Worldpay Commercetools Connector Extension module.
 * This stack receives API extension calls from Commercetools for
 * payment create/update actions.
 */
export class LambdaExtensionConstruct extends LambdaBaseConstruct {
  lambdaFunction: lambda.Function
  accessKey: iam.CfnAccessKey
  certsBucket: s3.IBucket

  constructor(parent: Construct, id: string, props: ConnectorStackProps) {
    super(parent, id, props)
  }

  protected provisionResources(): void {
    this.createCertsBucket()
    this.createLambda()
    this.createIamUser()
    this.createUserAccessKeySecret()
  }

  protected createCertsBucket() {
    this.certsBucket = new s3.Bucket(this, `${this.id}-certs-bucket-${this.props.stage}`, {
      bucketName: `payment-certs-${this.props.stage}.${this.fullyQualifiedDomainName}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })
  }

  protected createLambda() {
    this.lambdaFunction = this.createLambdaFunction(
      `${this.id}-function`,
      new lambda.AssetCode(`${this.props.paymentCodePath}`),
    )
  }

  protected createIamUser() {
    const paymentUser = new iam.User(this, `${this.id}-user-${this.props.stage}`, {
      userName: `${this.id}-user-${this.props.stage}`,
    })

    const inlinePolicy = new iam.Policy(this, `${this.id}-policy-${this.props.stage}`, {
      policyName: `${this.id}-policy-${this.props.stage}`,
      statements: [
        new iam.PolicyStatement({
          resources: [this.lambdaFunction.functionArn],
          actions: ['lambda:InvokeFunction'],
        }),
      ],
      users: [paymentUser],
    })

    this.accessKey = new iam.CfnAccessKey(this, `${this.id}-access-key-${this.props.stage}`, {
      userName: paymentUser.userName,
    })
  }

  protected createUserAccessKeySecret() {
    const paymentUserAccessSecret = new secretsManager.Secret(
      this,
      `${this.id}-payment-user-access-key-${this.props.stage}`,
      {
        secretName: `${this.id}-payment-user-access-key-${this.props.stage}`,
      },
    )

    const cfnSecret = paymentUserAccessSecret.node.defaultChild as secretsManager.CfnSecret
    cfnSecret.generateSecretString = undefined
    cfnSecret.secretString = `{ "ACCESS_KEY_ID": "${this.accessKey.ref}", "ACCESS_KEY_SECRET": "${this.accessKey.attrSecretAccessKey}" }`
  }
}
