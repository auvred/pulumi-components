import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'

import { constants } from '..'

export interface SentryCloudFrontTunnelArgs {
  sentryProjectId: pulumi.Input<string>
  sentryDsnDomainName: pulumi.Input<string>
  /** CloudFront origin id */
  originId: pulumi.Input<string>
  tunnelPath: pulumi.Input<string>
}

// Credit: https://rawdatum.com/posts/8th-piece/

/**
 * @example
 *
 * ```ts
 * new SentryCloudFrontTunnel('name', {
 *   sentryProjectId: '0000000000000000',
 *   sentryDsnDomainName: 'o1111111.ingest.us.sentry.io',
 *   originId: 'sentry-tunnel',
 *   tunnelPath: '/sentry',
 * })
 * ```
 */
export class SentryCloudFrontTunnel extends pulumi.ComponentResource {
  protected static originRequestPolicyId: pulumi.Output<string> | null = null
  static getOriginRequestPolicyId(): pulumi.Output<string> {
    if (this.originRequestPolicyId) {
      return this.originRequestPolicyId
    }

    const originRequestPolicy = new aws.cloudfront.OriginRequestPolicy(
      'auvred-sentry-cloudfront-tunnel-origin-request-policy',
      {
        cookiesConfig: {
          cookieBehavior: 'none',
        },
        headersConfig: {
          headerBehavior: 'whitelist',
          headers: {
            items: [
              'Origin',
              'Access-Control-Request-Method',
              'Access-Control-Request-Headers',
              'DSN',
              'Referer',
              'X-Sentry-Token',
              'X-Sentry-Auth',
            ],
          },
        },
        queryStringsConfig: {
          queryStringBehavior: 'all',
        },
      },
    )

    return (this.originRequestPolicyId = originRequestPolicy.id)
  }

  readonly origin: pulumi.Output<aws.types.input.cloudfront.DistributionOrigin>
  readonly cacheBehavior: pulumi.Output<aws.types.input.cloudfront.DistributionOrderedCacheBehavior>

  constructor(
    name: string,
    args: SentryCloudFrontTunnelArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super(
      'auvred:sentry-cloudfront-tunnel:SentryCloudFrontTunnel',
      name,
      args,
      opts,
    )

    const viewerRequestFunction = new aws.cloudfront.Function(
      `${name}-function`,
      {
        code: `
  function handler(event) {
    const request = event.request
    request.uri = '/api/${args.sentryProjectId}/envelope/'
    return request
  }
`,
        runtime: 'cloudfront-js-2.0',
        publish: true,
      },
      { parent: this },
    )

    this.registerOutputs({
      origin: (this.origin = pulumi.output({
        domainName: args.sentryDsnDomainName,
        originId: args.originId,
        customOriginConfig: {
          httpPort: 80,
          httpsPort: 443,
          originProtocolPolicy: 'https-only',
          originSslProtocols: ['TLSv1.2'],
        },
      })),
      cacheBehavior: (this.cacheBehavior = pulumi.output({
        pathPattern: args.tunnelPath,
        allowedMethods: [
          'GET',
          'HEAD',
          'OPTIONS',
          'PUT',
          'POST',
          'PATCH',
          'DELETE',
        ],
        cachedMethods: ['GET', 'HEAD'],
        targetOriginId: args.originId,
        viewerProtocolPolicy: 'redirect-to-https',
        cachePolicyId: constants.CloudFrontManagedCachePolicy.CACHING_DISABLED,
        originRequestPolicyId:
          SentryCloudFrontTunnel.getOriginRequestPolicyId(),
        responseHeadersPolicyId:
          constants.CloudFrontManagedResponseHeadersPolicy
            .CORS_WITH_PREFLIGHT_AND_SECURITY_HEADERS_POLICY,
        functionAssociations: [
          {
            functionArn: viewerRequestFunction.arn,
            eventType: 'viewer-request',
          },
        ],
      })),
    })
  }
}
