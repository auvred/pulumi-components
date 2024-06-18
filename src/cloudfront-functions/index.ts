import * as aws from '@pulumi/aws'

import type * as pulumi from '@pulumi/pulumi'

export type RewriteForSpaArgs = Record<string, never>

export class RewriteForSpa extends aws.cloudfront.Function {
  protected static cachedSingleton: RewriteForSpa | null = null
  static singletone() {
    return (
      this.cachedSingleton ??
      (this.cachedSingleton = new RewriteForSpa(
        'auvred-cloudfront-functions-singletone',
      ))
    )
  }

  constructor(
    name: string,
    args?: RewriteForSpaArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super(
      `${name}-rewrite-for-spa`,
      {
        code: `function handler(event) {
  var request = event.request;
  if (!request.uri.includes('.')) {
    request.uri = '/index.html';
  }
  return request;
}`,
        runtime: 'cloudfront-js-2.0',
        publish: true,
      },
      opts,
    )
  }
}
