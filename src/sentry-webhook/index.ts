import path from 'node:path'
import url from 'node:url'

import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'

export interface SentryWebhookArgs {
  sentryIntegrationToken: pulumi.Input<string>
  sentryClientSecret: pulumi.Input<string>
  telegramBotToken: pulumi.Input<string>
  telegramChatId: pulumi.Input<string>
  telegramChatThreadId?: pulumi.Input<string>
}

const dirname =
  typeof __dirname === 'undefined'
    ? path.dirname(url.fileURLToPath(import.meta.url))
    : __dirname

/**
 * @example
 *
 * ```ts
 * new SentryWebhook('name', {
 *   sentryIntegrationToken: 'xxxxxxx',
 *   sentryClientSecret: 'xxxxxxx',
 *   telegramBotToken: 'ddddd:xxxxxx',
 *   telegramChatId: '-100ddddddd',
 *   telegramChatThreadId: 'dd',
 * })
 * ```
 */
export class SentryWebhook extends pulumi.ComponentResource {
  readonly webhookEndpoint: pulumi.Output<string>

  constructor(
    name: string,
    args: SentryWebhookArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    const sentryIntegrationToken = pulumi.secret(args.sentryIntegrationToken)
    const sentryClientSecret = pulumi.secret(args.sentryClientSecret)
    const telegramBotToken = pulumi.secret(args.telegramBotToken)

    super(
      'auvred:sentry-webhook:SentryWebhook',
      name,
      {
        ...args,
        sentryIntegrationToken,
        sentryClientSecret,
        telegramBotToken,
      },
      opts,
    )

    const parameter = new aws.ssm.Parameter(
      `${name}-ssm-parameter`,
      {
        type: aws.ssm.ParameterType.SecureString,
        value: pulumi.jsonStringify({
          SENTRY_INTEGRATION_TOKEN: sentryIntegrationToken,
          SENTRY_CLIENT_SECRET: sentryClientSecret,
          TELEGRAM_BOT_TOKEN: telegramBotToken,
          TELEGRAM_CHAT_ID: args.telegramChatId,
          ...(args.telegramChatThreadId && {
            TELEGRAM_CHAT_THREAD_ID: args.telegramChatThreadId,
          }),
        }),
      },
      { parent: this },
    )

    const role = new aws.iam.Role(
      `${name}-execution-role`,
      {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal(
          aws.iam.Principals.LambdaPrincipal,
        ),
        managedPolicyArns: [aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole],
        inlinePolicies: [
          {
            name: 'execution-policy',
            policy: parameter.arn.apply(parameterArn =>
              aws.iam
                .getPolicyDocument({
                  statements: [
                    {
                      effect: 'Allow',
                      actions: ['ssm:GetParameter'],
                      resources: [parameterArn],
                    },
                  ],
                })
                .then(r => r.json),
            ),
          },
        ],
      },
      { parent: this },
    )
    const handler = new aws.lambda.Function(
      `${name}-handler`,
      {
        code: new pulumi.asset.AssetArchive({
          'handler.mjs': new pulumi.asset.FileAsset(
            path.join(dirname, 'assets', 'sentry-webhook.handler.mjs'),
          ),
        }),
        runtime: aws.lambda.Runtime.NodeJS20dX,
        handler: 'handler.handler',
        role: role.arn,
        timeout: 60 * 3,
        memorySize: 256,
        environment: {
          variables: {
            VARIABLES_PARAMETER_ARN: parameter.arn,
          },
        },
      },
      { parent: this },
    )
    new aws.lambda.FunctionEventInvokeConfig(
      `${name}-handler-event-invoke-config`,
      {
        functionName: handler.name,
        maximumRetryAttempts: 0,
      },
      { parent: this },
    )
    new aws.cloudwatch.LogGroup(
      `${name}-handler-log-group`,
      {
        name: pulumi.interpolate`/aws/lambda/${handler.name}`,
        retentionInDays: 14,
      },
      { parent: this },
    )

    const functionUrl = new aws.lambda.FunctionUrl(
      `${name}-handler-function-url`,
      {
        functionName: handler.name,
        authorizationType: 'NONE',
      },
      { parent: this },
    )

    this.registerOutputs({
      webhookEndpoint: (this.webhookEndpoint = functionUrl.functionUrl),
    })
  }
}
