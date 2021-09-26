import * as cdk from '@aws-cdk/core'
import * as iam from '@aws-cdk/aws-iam'
import * as apig from '@aws-cdk/aws-apigateway'
import * as s3 from '@aws-cdk/aws-s3'
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ecs from '@aws-cdk/aws-ecs';
import * as elbv2 from '@aws-cdk/aws-elasticloadbalancingv2';
import * as logs from '@aws-cdk/aws-logs'
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';

import * as _ from 'lodash'
import { WorldpayConnectorStackProps } from './worldpayConnectorBaseStack'
import { WorldpayConnectorBaseConstruct } from './worldpayConnectorBaseConstruct'

/**
 * CDK Construct base class for Notification and Extension modules.
 */
abstract class WorldpayConnectorDockerBaseConstruct extends WorldpayConnectorBaseConstruct {
  props: WorldpayConnectorStackProps
  vpc: ec2.IVpc
  cluster: ecs.ICluster

  constructor(parent: cdk.Construct, id: string, props: WorldpayConnectorStackProps) {
    super(parent, id, props)
    this.props = props
  }

  private createEcsExecutionRole(id: string) {
    const ecsExecutionPolicy = new iam.PolicyDocument({
      statements: [this.createSecretsPolicyStatement()]
    })

    const ecsExecutionRole = new iam.Role(this, id, {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: id,
      inlinePolicies: { ecsExecutionPolicy },
      managedPolicies: [
        iam.ManagedPolicy.fromManagedPolicyArn(
          this, 'AmazonECSTaskExecutionRolePolicy',
          'arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy')
      ]
    })

    return ecsExecutionRole
  }

  createEcsTask(id: string, apiEndpoint: string, envVars?: object) {
    const dockerImageAsset = new DockerImageAsset(this, `${id}DockerImageAsset`, {
      directory: '../connector/'
    })

    const role = this.createEcsExecutionRole(`${id}Role`)
    const ecsTask = new ecs.FargateTaskDefinition(this, `${id}EcsTask`, {
      cpu: this.props.cpu,
      executionRole: role,
      family: id,
      memoryLimitMiB: this.props.memorySizeinMb,
      taskRole: role
    })

    const logGroup: any = new logs.LogGroup(this, `${id}LogGroup`, {
      logGroupName: `${id}LogGroup`,
      retention: this.props.logRetentionDays,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    const container = ecsTask.addContainer(`${id}EcsContainer`, {
      command: ['node', 'entrypoint-aws-docker.js'],
      cpu: this.props.cpu,
      disableNetworking: false,
      environment: {
        NODE_OPTIONS: `--max_old_space_size=${this.props.memorySizeinMb}`,
        REGION: this.props.region,
        WORLDPAY_EXTENSION_LOG_LEVEL: 'debug',
        WORLDPAY_EXTENSION_ENDPOINT: apiEndpoint,
        WORLDPAY_EXTENSION_BEARER_TOKEN: 'ABC123',
        WORLDPAY_EXTENSION_API_BASE_PATH: `/${this.props.apiPath}`,
        WORLDPAY_EXTENSION_INCLUDE_FRAUDSIGHT: 'true',
        WORLDPAY_ENV: 'test',
        SECRET_NAMES: this.props.secretNames || '',
        ...envVars
      },
      image: ecs.ContainerImage.fromDockerImageAsset(dockerImageAsset),
      logging: ecs.LogDriver.awsLogs({
        logGroup: logGroup,
        streamPrefix: `${this.props.dockerImageName}/${this.props.name}`
      }),
      memoryLimitMiB: this.props.memorySizeinMb,
      privileged: false
    })

    container.addPortMappings({
      containerPort: this.props.appPort
    })

    return ecsTask
  }

  createLoadBalancer(id: string) {
    const loadBalancer = new elbv2.ApplicationLoadBalancer(this, `${id}LoadBalancer`, {
      http2Enabled: true,
      internetFacing: true,
      ipAddressType: elbv2.IpAddressType.IPV4,
      vpc: this.vpc
    })

    const targetGroup = new elbv2.ApplicationTargetGroup(this, `${id}TargetGroup`, {
      healthCheck: {
        path: this.props.healthCheckPath
      },
      protocol: elbv2.ApplicationProtocol.HTTP,
      port: this.props.appPort,
      targetType: elbv2.TargetType.IP,
      vpc: this.vpc
    })

    const listener = loadBalancer.addListener(`${id}Listener`, {
      open: true,
      port: this.props.appPort,
      protocol: elbv2.ApplicationProtocol.HTTP,
      defaultTargetGroups: [targetGroup]
    })

    return { loadBalancer, targetGroup }
  }

  createEcsService(id: string, taskDefinition: ecs.TaskDefinition, targetGroup: elbv2.IApplicationTargetGroup) {
    const ecsService = new ecs.FargateService(this, `${id}EcsService`, {
      taskDefinition: taskDefinition,
      assignPublicIp: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      cluster: this.cluster,
      desiredCount: this.props.desiredCount,
      maxHealthyPercent: 100,
      minHealthyPercent: 1,
      deploymentController: {
        type: ecs.DeploymentControllerType.ECS
      },
      serviceName: `${id}Service`
    })

    ecsService.attachToApplicationTargetGroup(targetGroup)
    return ecsService
  }

  createRestApi(id: string, endpointUrl: string) {
    const api = new apig.RestApi(this, id, {
      cloudWatchRole: false,
      description: id,
      deploy: true,
      deployOptions: {
        description: `${id} - ${this.props.stage} stage`,
        stageName: this.props.stage,
      },
      endpointConfiguration: {
        types: [apig.EndpointType.REGIONAL]
      },
      restApiName: id
    })

    const rootIntegration = new apig.HttpIntegration(endpointUrl, {
      httpMethod: 'ANY'
    })

    api.root.addMethod('ANY', rootIntegration, {
      methodResponses: [{
        statusCode: '200',
        responseModels: {
          'application/json': apig.Model.EMPTY_MODEL
        }
      }]
    })

    const proxyIntegration = new apig.HttpIntegration(`${endpointUrl}/{proxy}`, {
      httpMethod: 'ANY',
      options: {
        requestParameters: {
          'integration.request.path.proxy': 'method.request.path.proxy'
        }
      }
    })

    api.root.addResource('{proxy+}').addMethod('ANY', proxyIntegration, {
      requestParameters: {
        'method.request.path.proxy': false
      }
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
export class WorldpayConnectorDockerExtensionConstruct extends WorldpayConnectorDockerBaseConstruct {
  constructor(parent: cdk.Construct, props: WorldpayConnectorStackProps, vpc: ec2.IVpc, cluster: ecs.ICluster) {
    super(parent, 'WorldpayConnectorExtensionModule', props)
    this.vpc = vpc
    this.cluster = cluster

    const apiEndpoint = `https://${props.extensionSubdomain}.${props.domain}/${props.apiPath}`
    this.addOutput('Extension External API URL', apiEndpoint)
    const id = 'WorldpayExtensionDocker'

    const { loadBalancer, targetGroup } = this.createLoadBalancer(id)
    const endpointUrl = `http://${loadBalancer.loadBalancerDnsName}:${this.props.appPort}`

    const ecsTask = this.createEcsTask(id, apiEndpoint, {
      ENABLE_NOTIFICATION_ROUTE: 'false',
      ENABLE_EXTENSION_ROUTE: 'true'
    })
    this.createEcsService(id, ecsTask, targetGroup)

    this.api = this.createRestApi('WorldpayExtensionDockerAPI', endpointUrl)
    this.createApiGatewayMappings('WorldpayExtensionDocker', props.extensionSubdomain, this.sslCertificate)
  }
}

/**
 * CDK Construct for the Worldpay Commercetools Connector Notification module.
 * This stack receives callback notifications from Worldpay via an API Gateway
 * endpoint secured with Mutual TLS using the Worldpay root certificate.
 */
export class WorldpayConnectorDockerNotificationConstruct extends WorldpayConnectorDockerBaseConstruct {
  constructor(parent: cdk.Construct, props: WorldpayConnectorStackProps, vpc: ec2.IVpc, cluster: ecs.ICluster) {
    super(parent, 'WorldpayConnectorNotificationModule', props)
    this.vpc = vpc
    this.cluster = cluster

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
    const id = 'WorldpayNotificationDocker'

    const { loadBalancer, targetGroup } = this.createLoadBalancer(id)
    const endpointUrl = `http://${loadBalancer.loadBalancerDnsName}:${this.props.appPort}`

    const ecsTask = this.createEcsTask(id, secureApiEndpoint, {
      ENABLE_NOTIFICATION_ROUTE: 'true',
      ENABLE_EXTENSION_ROUTE: 'false'
    })
    this.createEcsService(id, ecsTask, targetGroup)

    this.api = this.createRestApi('WorldpayNotificationDockerAPI', endpointUrl)
    this.createApiGatewayMappings('WorldpayNotificationDocker', props.notificationSubdomain, this.sslCertificate, mtlsConfig)
  }
}



