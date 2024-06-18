/** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html} */
export const CloudFrontManagedCachePolicy = {
  /** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-amplify} */
  AMPLIFY: '2e54312d-136d-493c-8eb9-b001f22f67d2',
  /** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-caching-disabled} */
  CACHING_DISABLED: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad',
  /** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-caching-optimized} */
  CACHING_OPTIMIZED: '658327ea-f89d-4fab-a63d-7e88639e58f6',
  /** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-caching-optimized-uncompressed} */
  CACHING_OPTIMIZED_FOR_UNCOMPRESSED_OBJECTS:
    'b2884449-e4de-46a7-ac36-70bc7f1ddd6d',
  /** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-mediapackage} */
  ELEMENTAL_MEDIA_PACKAGE: '08627262-05a9-4f76-9ded-b50ca2e3a84f',
  /** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-origin-cache-headers} */
  USE_ORIGIN_CACHE_CONTROL_HEADERS: '83da9c7e-98b4-4e11-a168-04f0df8e2c65',
  /** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-cache-policies.html#managed-cache-policy-origin-cache-headers-query-strings} */
  USE_ORIGIN_CACHE_CONTROL_HEADERS_QUERY_STRINGS:
    '4cc15a8a-d715-48a4-82b8-cc0b614638fe',
} as const

/** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html} */
export const CloudFrontManagedOriginRequestPolicy = {
  /** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html#managed-origin-request-policy-all-viewer} */
  ALL_VIEWER: '216adef6-5c7f-47e4-b989-5492eafa07d3',
  /** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html#managed-origin-request-policy-all-viewer-and-cloudfront} */
  ALL_VIEWER_AND_CLOUD_FRONT_HEADERS_2022_06:
    '33f36d7e-f396-46d9-90e0-52428a34d9dc',
  /** @see {@link  https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html#managed-origin-request-policy-all-viewer-except-host-header} */
  ALL_VIEWER_EXCEPT_HOST_HEADER: 'b689b0a8-53d0-40ab-baf2-68738e2966ac',
  /** @see {@link  https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html#managed-origin-request-policy-cors-custom} */
  CORS_CUSTOM_ORIGIN: '59781a5b-3903-41f3-afcb-af62929ccde1',
  /** @see {@link  https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html#managed-origin-request-policy-cors-s3} */
  CORS_S3_ORIGIN: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf',
  /** @see {@link  https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html#managed-origin-request-policy-mediatailor} */
  ELEMENTAL_MEDIA_TAILOR_PERSONALIZED_MANIFESTS:
    '775133bc-15f2-49f9-abea-afb2e0bf67d2',
  /** @see {@link  https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-origin-request-policies.html#managed-origin-request-policy-user-agent-referer} */
  USER_AGENT_REFERER_HEADERS: 'acba4595-bd28-49b8-b9fe-13317c0390fa',
} as const

/** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-response-headers-policies.html} */
export const CloudFrontManagedResponseHeadersPolicy = {
  /** @see {@link https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-response-headers-policies.html#managed-response-headers-policies-cors-security} */
  CORS_AND_SECURITY_HEADERS_POLICY: 'e61eb60c-9c35-4d20-a928-2b84e02af89c',
  /** @see {@linkhttps://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-response-headers-policies.html#managed-response-headers-policies-cors-preflight} */
  CORS_WITH_PREFLIGHT: '5cc3b908-e619-4b99-88e5-2cf7f45965bd',
  /** @see {@linkhttps://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-response-headers-policies.html#managed-response-headers-policies-cors-preflight-security} */
  CORS_WITH_PREFLIGHT_AND_SECURITY_HEADERS_POLICY:
    'eaab4381-ed33-4a86-88ca-d9558dc6cd63',
  /** @see {@linkhttps://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-response-headers-policies.html#managed-response-headers-policies-security} */
  SECURITY_HEADERS_POLICY: '67f7725c-6f97-4210-82d7-5512b31e9d03',
  /** @see {@linkhttps://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/using-managed-response-headers-policies.html#managed-response-headers-policies-cors} */
  SIMPLE_CORS: '60669652-455b-4ae9-85a4-c4c02393f86c',
} as const
