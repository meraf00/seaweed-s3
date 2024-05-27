import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Injectable } from '@nestjs/common';
import { S3 } from '../types';

@Injectable()
export class AwsS3 extends S3 {
  constructor(private readonly s3: S3Client) {
    super();
  }

  async presignedPutObject(
    bucketName: string,
    objectName: string,
    contentType: string,
    duration: number,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectName,
      ContentType: contentType,
    });

    return await getSignedUrl(this.s3, command, {
      expiresIn: duration,
      signingDate: new Date(),
    });
  }

  async presignedGetObject(
    bucketName: string,
    objectName: string,
    contentType: string,
    duration: number,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectName,
    });

    return await getSignedUrl(this.s3, command, { expiresIn: duration });
  }

  async deleteObject(bucketName: string, objectName: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectName,
    });

    await this.s3.send(command);
  }

  async getObject(bucketName: string, objectName: string): Promise<any> {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectName,
    });

    return Buffer.from(
      await (await this.s3.send(command)).Body.transformToByteArray(),
    );
  }

  async putObject(
    bucketName: string,
    objectName: string,
    data: Buffer,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectName,
      Body: data,
    });

    await this.s3.send(command);
  }
}
