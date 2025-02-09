import * as aws from '@pulumi/aws'
import * as pulumi from '@pulumi/pulumi'

export interface ValidatedAcmCertificateArgs {
  hostedZoneId: pulumi.Input<string>
  domainName: pulumi.Input<string>
  subjectAlternativeNames?: pulumi.Input<pulumi.Input<string>[]>
  /**
   * Whether to create a certificate in the us-east-1 region (to use it in the
   * CloudFront distribution)
   */
  global?: boolean
}

let awsUsEast1Provider: aws.Provider | null = null

/**
 * @example
 *
 * ```ts
 * new ValidatedAcmCertificate('name', {
 *   hostedZoneId: '000000000000',
 *   domainName: 'mydomain.example.com',
 *   subjectAlternativeNames: ['*.mydomain.example.com'],
 *   global: true,
 * })
 * ```
 */
export class ValidatedAcmCertificate extends pulumi.ComponentResource {
  readonly certificateArn: pulumi.Input<string>

  constructor(
    name: string,
    args: ValidatedAcmCertificateArgs,
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super(
      'auvred:validated-acm-certificate:ValidatedAcmCertificate',
      name,
      args,
      opts,
    )

    const childOpts: pulumi.CustomResourceOptions = {
      parent: this,
      ...(args.global && {
        provider:
          awsUsEast1Provider ??
          (awsUsEast1Provider = new aws.Provider(
            `${name}-aws-us-east-1-provider`,
            { region: 'us-east-1' },
          )),
      }),
    }

    const cert = new aws.acm.Certificate(
      `${name}-certificate`,
      {
        domainName: args.domainName,
        ...(args.subjectAlternativeNames && {
          subjectAlternativeNames: args.subjectAlternativeNames,
        }),
        validationMethod: 'DNS',
      },
      childOpts,
    )
    const validationRecordFqdns = cert.domainValidationOptions.apply(
      domainValidationOptions =>
        Object.values(
          domainValidationOptions.reduce<
            Record<
              string,
              aws.types.output.acm.CertificateDomainValidationOption
            >
          >(
            (acc, validationOption) => ({
              ...acc,
              // dedupe by resourceRecordName
              [validationOption.resourceRecordName]: validationOption,
            }),
            {},
          ),
        ).map(
          validationOption =>
            new aws.route53.Record(
              `${name}-record-${validationOption.domainName}`,
              {
                name: validationOption.resourceRecordName,
                allowOverwrite: true,
                records: [validationOption.resourceRecordValue],
                ttl: 60,
                type: validationOption.resourceRecordType,
                zoneId: args.hostedZoneId,
              },
              childOpts,
            ).fqdn,
        ),
    )

    const validation = new aws.acm.CertificateValidation(
      `${name}-validation`,
      {
        certificateArn: cert.arn,
        validationRecordFqdns,
      },
      childOpts,
    )

    this.registerOutputs({
      certificateArn: (this.certificateArn = validation.certificateArn),
    })
  }
}
