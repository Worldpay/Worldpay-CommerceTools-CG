import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as lambda from '@aws-cdk/aws-lambda'
import * as apig from '@aws-cdk/aws-apigateway'
import * as s3 from '@aws-cdk/aws-s3'
import * as _ from 'lodash'
import { WorldpayConnectorStackProps } from './worldpayConnectorBaseStack'
import { WorldpayConnectorBaseConstruct } from './worldpayConnectorBaseConstruct'

/**
 * CDK Construct base class for Notification and Extension modules.
 */
abstract class WorldpayConnectorLambdaBaseConstruct extends WorldpayConnectorBaseConstruct {

  props: WorldpayConnectorStackProps

  constructor(parent: cdk.Construct, id: string, props: WorldpayConnectorStackProps) {
    super(parent, id, props)
    this.props = props
  }

  private createLambdaRole(id: string) {
    const lambdaPolicy = new iam.PolicyDocument({
      statements: [this.createSecretsPolicyStatement()]
    })

    const lambdaRole = new iam.Role(this, id, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: id,
      inlinePolicies: { lambdaPolicy },
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(
          this,
          'AWSLambdaBasicExecutionRole',
          'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole')
      ]
    })

    return lambdaRole
  }

  createLambdaFunction(id: string, apiEndpoint: string, envVars?: object) {
    const lambdaFunction = new lambda.Function(this, id, {
      functionName: id,
      handler: 'connector/entrypoint-aws-lambda.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('../connector', {
        // files/paths to exclude from lambda packaging
        exclude: ['__tests__', '.coverage', 'Dockerfile', '.dockerignore', 'jest*', '*.md'],
      }),
      environment: {
        WORLDPAY_EXTENSION_LOG_LEVEL: 'debug',
        WORLDPAY_EXTENSION_ENDPOINT: apiEndpoint,
        WORLDPAY_EXTENSION_BEARER_TOKEN: 'ABC123',
        WORLDPAY_EXTENSION_API_BASE_PATH: `/${this.props.apiPath}`,
        WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT: 'true',
        WORLDPAY_ENV: 'test',
        SECRET_NAMES: this.props.secretNames || '',
        ...envVars
      },
      logRetention: this.props.logRetentionDays,
      memorySize: this.props.memorySizeinMb,
      reservedConcurrentExecutions: this.props.reservedConcurrentExecutions,
      role: this.createLambdaRole(`${id}Role`),
      timeout: cdk.Duration.seconds(this.props.timeoutInSecs)
    })

    this.addOutput(`${id} ARN`, lambdaFunction.functionArn)

    return lambdaFunction
  }

  createRestApi(id: string, lambdaFunction: lambda.Function) {
    const api = new apig.LambdaRestApi(this, id, {
      cloudWatchRole: false,
      description: id,
      deploy: true,
      deployOptions: {
        description: `${id} - ${this.props.stage} stage`,
        methodOptions: {},
        stageName: this.props.stage,
        variables: {}
      },
      endpointConfiguration: {
        types: [apig.EndpointType.REGIONAL]
      },
      handler: lambdaFunction,
      restApiName: id,
      parameters: {},
      proxy: true // This is the default value - we can lock this down to only accept POST requests
    })

    this.addOutput(`${id} ID`, api.restApiId)
    this.addOutput(`${id} Internal  URL`, api.url)

    return api
  }

}

/**
 * CDK Construct for the Worldpay Commercetools Connector Extension module.
 * This stack receives API extension calls from Commercetools for
 * payment create/update actions.
 */
export class WorldpayConnectorLambdaExtensionConstruct extends WorldpayConnectorLambdaBaseConstruct {
  constructor(parent: cdk.Construct, props: WorldpayConnectorStackProps) {
    super(parent, 'WorldpayConnectorExtensionModule', props)

    const apiEndpoint = `https://${props.extensionSubdomain}.${props.domain}/${props.apiPath}`
    this.addOutput('Extension External API URL', apiEndpoint)

    const lambdaFunction = this.createLambdaFunction('WorldpayExtensionLambdaFunction', apiEndpoint, {
      ENABLE_NOTIFICATION_ROUTE: 'false',
      ENABLE_EXTENSION_ROUTE: 'true'
    })

    this.api = this.createRestApi('WorldpayExtensionAPI', lambdaFunction)
    this.createApiGatewayMappings('WorldpayExtension', this.props.extensionSubdomain, this.sslCertificate)
  }
}

/**
 * CDK Construct for the Worldpay Commercetools Connector Notification module.
 * This stack receives callback notifications from Worldpay via an API Gateway
 * endpoint secured with Mutual TLS using the Worldpay root certificate.
 */
export class WorldpayConnectorLambdaNotificationConstruct extends WorldpayConnectorLambdaBaseConstruct {
  constructor(parent: cdk.Construct, props: WorldpayConnectorStackProps) {
    super(parent, 'WorldpayConnectorNotificationModule', props)

    // Retrieve the worldpay certificate bucket via CFN exported value.
    // The WorldpayCertificateStack should have already deployed that asset and set the param.
    const mutualTlsCertificateBucketName = cdk.Fn.importValue(`worldpay-certificate-${this.props.stage}-worldpayCertificateBucket`)
    const certificateBucket = s3.Bucket.fromBucketName(this, 'certificate-bucket', mutualTlsCertificateBucketName)
    const mtlsConfig = <apig.MTLSConfig>{
      bucket: certificateBucket,
      key: 'worldpay-root-certificate.pem'
    }

    const secureApiEndpoint = `https://${props.notificationSubdomain}.${props.domain}/${props.apiPath}`
    this.addOutput('Notification External API URL', secureApiEndpoint)

    const lambdaFunction = this.createLambdaFunction('WorldpayNotificationLambdaFunction', secureApiEndpoint, {
      ENABLE_NOTIFICATION_ROUTE: 'true',
      ENABLE_EXTENSION_ROUTE: 'false'
    })

    this.api = this.createRestApi('WorldpayNotificationAPI', lambdaFunction)
    this.createApiGatewayMappings('WorldpayNotification', this.props.notificationSubdomain, this.sslCertificate, mtlsConfig)
  }
}



