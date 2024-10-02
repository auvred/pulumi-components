import * as aws from '@pulumi/aws'

import type * as pulumi from '@pulumi/pulumi'

export type RewriteForSpaArgs = Record<string, never>

export class RewriteForSpa extends aws.cloudfront.Function {
  protected static cachedSingleton: RewriteForSpa | null = null
  static singletone(): RewriteForSpa {
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

export interface ReplaceInURIArgs {
  pattern: RegExp
  replacement: string
}

/**
 * Replace some part of request uri
 *
 * @example
 *
 * ```ts
 * // Replaces `/api/some-route` to `/some-route`
 * new ReplaceInURI('name', {
 *   pattern: /^\/api/,
 *   replacement: '',
 * })
 * ```
 *
 * @example
 *
 * ```ts
 * // Replaces `/api/api/some-route` to `/api/some-route`
 * new ReplaceInURI('name', {
 *   pattern: /\/api/g,
 *   replacement: '',
 * })
 * ```
 */
export class ReplaceInURI extends aws.cloudfront.Function {
  constructor(
    name: string,
    args: ReplaceInURIArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    const escapedPattern = (
      typeof args.pattern === 'string' ? new RegExp(args.pattern) : args.pattern
    ).toString()

    super(
      name,
      {
        code: `function handler(event) {
  const request = event.request;
  request.uri = request.uri.replace(${escapedPattern}, ${JSON.stringify(
    args.replacement,
  )});
  return request;
}`,
        runtime: 'cloudfront-js-2',
        publish: true,
      },
      opts,
    )
  }
}
