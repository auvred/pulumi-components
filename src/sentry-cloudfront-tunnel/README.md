# SentryCloudFrontTunnel

## Motivation

ingest.sentry.com is blocked by many ad-blockers. See:

- https://github.com/uBlockOrigin/uAssets/pull/7924
- https://github.com/easylist/easylist/issues/6963
- ...

One solution is to proxy Sentry requests. You can read more about tunneling in the [Sentry troubleshooting docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/troubleshooting).

`SentryCloudFrontTunnel` is intended to be used as an additional CloudFront cache behavior.

## Usage example

```ts
// pulumi-program.ts

const tunnel = new SentryCloudFrontTunnel('name', {
  sentryProjectId: '0000000000000000',
  sentryDsnDomainName: 'o1111111.ingest.us.sentry.io',
  originId: 'sentry-tunnel',
  tunnelPath: '/my-sentry-tunnel',
})

new aws.cloudfront.Distribution('distribution', {
  // ...
  origins: [
    {
      // code-running-in-browser.ts origin
    },
    // ...
    tunnel.origin,
  ],
  orderedCacheBehaviors: [
    // ...
    tunnel.cacheBehavior,
  ],
  // ...
})

// code-running-in-browser.ts

Sentry.init({
  dsn: 'https://public-key@o1111111.ingest.us.sentry.io/0000000000000000',
  tunnel: '/my-sentry-tunnel',
})
```

## Credit

`SentryCloudFrontTunnel` was inspired by https://rawdatum.com/posts/8th-piece/
