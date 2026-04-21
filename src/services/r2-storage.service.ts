import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getR2Config } from '../config/r2.js';

let client: S3Client | null = null;

function getClient(): { client: S3Client; bucket: string; publicBaseUrl: string } {
  const cfg = getR2Config();
  if (!client) {
    client = new S3Client({
      region: cfg.region,
      endpoint: cfg.endpoint,
      credentials: {
        accessKeyId: cfg.accessKeyId,
        secretAccessKey: cfg.secretAccessKey,
      },
      forcePathStyle: true,
    });
  }
  return { client, bucket: cfg.bucket, publicBaseUrl: cfg.publicBaseUrl };
}

export class R2StorageService {
  async uploadObject(params: { key: string; body: Buffer; contentType: string }): Promise<string> {
    const { client, bucket, publicBaseUrl } = getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );
    const encodedKey = params.key
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    return `${publicBaseUrl}/${encodedKey}`;
  }
}
