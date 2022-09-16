import { BaseConstruct } from '../common/baseConstruct'
import { ConnectorStackProps } from '../common/baseStack'
import { Construct } from 'constructs'
import * as iam from 'aws-cdk-lib/aws-iam'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as cdk from 'aws-cdk-lib'
import * as apig from 'aws-cdk-lib/aws-apigateway'
import * as certificateManager from 'aws-cdk-lib/aws-certificatemanager'
import * as route53 from 'aws-cdk-lib/aws-route53'
import * as route53Target from 'aws-cdk-lib/aws-route53-targets'
import * as secretsManager from 'aws-cdk-lib/aws-secretsmanager'

/**
 * CDK Construct base class for Notification and Extension modules.
 */
export abstract class LambdaBaseConstruct extends BaseConstruct {
  props: ConnectorStackProps

  protected constructor(parent: Construct, id: string, props: ConnectorStackProps) {
    super(parent, id, props)
    this.props = props
  }

  protected createApiGatewayMappings(
    id: string,
    subDomain: string,
    sslCertificate: certificateManager.ICertificate,
    mtlsConfig?: apig.MTLSConfig,
  ) {
    const fullDomainName =
      this.props.stage == 'prd'
        ? `${subDomain}.${this.fullyQualifiedDomainName}`
        : `${subDomain}-${this.props.stage}.${this.fullyQualifiedDomainName}`

    // Mappings for extension/notification with optional mTLS support
    const customDomain = new apig.DomainName(this, `${id}-custom-domain`, {
      domainName: fullDomainName,
      certificate: sslCertificate,
      endpointType: apig.EndpointType.REGIONAL,
      securityPolicy: apig.SecurityPolicy.TLS_1_2,
      mtls: mtlsConfig,
    })

    new apig.BasePathMapping(this, `${id}-api-basepath-mapping`, {
      basePath: this.props.apiPath,
      domainName: customDomain,
      restApi: this.api,
      stage: this.api.deploymentStage,
    })

    new route53.ARecord(this, `${id}-custom-domain-arecord`, {
      recordName: this.props.stage == 'prd' ? `${subDomain}` : `${subDomain}-${this.props.stage}`,
      target: route53.RecordTarget.fromAlias(new route53Target.ApiGatewayDomain(customDomain)),
      zone: this.hostedZone,
    })
  }

  // Create IAM SecretsManager policy statement allowing read of all configured named secrets
  protected createSecretsPolicyStatement() {
    const secretNames = [this.props.worldpaySecretName, this.props.commercetoolsSecretName]
    const secretArns = secretNames.map(
      (secretName: string) =>
        `arn:aws:secretsmanager:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:secret:${secretName}-??????`,
    )

    return new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['secretsmanager:GetSecretValue'],
      resources: secretArns,
    })
  }

  protected createLambdaRole(id: string) {
    const lambdaPolicy = new iam.PolicyDocument({
      statements: [this.createSecretsPolicyStatement()],
    })

    return new iam.Role(this, id, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: `${id} - ${this.props.stage} stage`,
      inlinePolicies: { lambdaPolicy },
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(
          this,
          'AWSLambdaBasicExecutionRole',
          'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
        ),
      ],
    })
  }

  protected createLambdaFunction(id: string, code: lambda.AssetCode, envVars?: object) {
    const commercetoolsSecrets = secretsManager.Secret.fromSecretNameV2(
      this,
      `${this.props.stackName}-commercetools-secret`,
      `${this.props.stackName}-${this.props.commercetoolsSecretName}-${this.props.stage}`,
    )

    const worldpaySecrets = secretsManager.Secret.fromSecretNameV2(
      this,
      `${this.props.stackName}-worldpay-secret`,
      `${this.props.stackName}-${this.props.worldpaySecretName}-${this.props.stage}`,
    )

    const lambdaFunction = new lambda.Function(this, id, {
      functionName: `${id}-${this.props.stage}`,
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      code: code,
      environment: {
        WORLDPAY_CONNECTOR_LOG_LEVEL: 'debug',
        WORLDPAY_CONNECTOR_INCLUDE_FRAUDSIGHT: 'true',
        WORLDPAY_CONNECTOR_ENABLE_TOKENISATION: 'true',
        WORLDPAY_CONNECTOR_ENABLE_EXEMPTION_ENGINE: 'true',
        WORLDPAY_CONNECTOR_EXEMPTION_TYPE: 'OP',
        WORLDPAY_CONNECTOR_EXEMPTION_PLACEMENT: 'OPTIMISED',
        WORLDPAY_CONNECTOR_ENV: 'test',
        WORLDPAY_CONNECTOR_MERCHANT_CODE: worldpaySecrets.secretValueFromJson('WORLDPAY_MERCHANT_CODE').toString(),
        WORLDPAY_CONNECTOR_XML_USERNAME: worldpaySecrets.secretValueFromJson('WORLDPAY_XML_USERNAME').toString(),
        WORLDPAY_CONNECTOR_MAC_SECRET: worldpaySecrets.secretValueFromJson('WORLDPAY_MAC_SECRET').toString(),
        WORLDPAY_CONNECTOR_XML_PASSWORD: worldpaySecrets.secretValueFromJson('WORLDPAY_XML_PASSWORD').toString(),
        WORLDPAY_CONNECTOR_INSTALLATION_ID: worldpaySecrets.secretValueFromJson('WORLDPAY_INSTALLATION_ID').toString(),
        WORLDPAY_CONNECTOR_CTP_PROJECT_KEY: commercetoolsSecrets.secretValueFromJson('CTP_PROJECT_KEY').toString(),
        WORLDPAY_CONNECTOR_CTP_CLIENT_ID: commercetoolsSecrets.secretValueFromJson('CTP_CLIENT_ID').toString(),
        WORLDPAY_CONNECTOR_CTP_CLIENT_SECRET: commercetoolsSecrets.secretValueFromJson('CTP_CLIENT_SECRET').toString(),
        WORLDPAY_CONNECTOR_CTP_REGION: this.props.commercetools.region,
        WORLDPAY_CONNECTOR_CTP_TIMEOUT_MS: this.props.commercetools.timeout.toString(),
        WORLDPAY_CONNECTOR_CTP_API_URL: this.props.commercetools.apiUrl,
        WORLDPAY_CONNECTOR_CTP_AUTH_URL: this.props.commercetools.authUrl,
        WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_ID: 'merchant.com.gradientedge.worldpayconnector',
        WORLDPAY_CONNECTOR_APPLE_PAY_MERCHANT_DOMAIN: `storefront-${this.props.stage}.${this.fullyQualifiedDomainName}`,
        WORLDPAY_CONNECTOR_MERCHANT_NAME: 'Sunrise Worldpay Shop',
        WORLDPAY_CONNECTOR_TERMS_URL: `https://storefront-${this.props.stage}.${this.fullyQualifiedDomainName}/#`,
        WORLDPAY_CONNECTOR_RETURN_URL: `https://storefront-${this.props.stage}.${this.fullyQualifiedDomainName}/checkout/`,
        WORLDPAY_CONNECTOR_SPACES_IN_PAYPAL_DESCRIPTION: 'true',
        WORLDPAY_CONNECTOR_MAP_STATE_TO_ISO_3611_2: 'false',
        ...envVars,
      },
      logRetention: this.props.logRetentionDays,
      memorySize: this.props.memorySizeinMb,
      reservedConcurrentExecutions: 100,
      role: this.createLambdaRole(`${id}-role`),
      timeout: cdk.Duration.seconds(this.props.timeoutInSecs),
    })

    this.addOutput(`${id}-lambdaArn`, lambdaFunction.functionArn)

    return lambdaFunction
  }

  protected createRestApi(id: string, lambdaFunction: lambda.Function) {
    const api = new apig.LambdaRestApi(this, id, {
      cloudWatchRole: false,
      description: id,
      deploy: true,
      deployOptions: {
        description: `${id} - ${this.props.stage} stage`,
        methodOptions: {},
        stageName: this.props.stage,
        variables: {},
      },
      endpointConfiguration: {
        types: [apig.EndpointType.REGIONAL],
      },
      handler: lambdaFunction,
      restApiName: `${id}-${this.props.stage}`,
      parameters: {},
      proxy: true, // This is the default value - we can lock this down to only accept POST requests
    })

    this.addOutput(`${id}-restApiId`, api.restApiId)
    this.addOutput(`${id}-restApiInternalUrl`, api.url)

    return api
  }
}
