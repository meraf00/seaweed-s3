import { S3 } from 'aws-sdk';

import { Injectable } from '@nestjs/common';
import { FileInfo, S3Client } from '../types';

@Injectable()
export class AwsS3 extends S3Client {
  constructor(private readonly s3: S3) {
    super();
  }

  async presignedPutObject(
    bucketName: string,
    objectName: string,
    contentType: string,
    duration: number,
  ): Promise<string> {
    const params = {
      Bucket: bucketName,
      Key: objectName,
      ContentType: contentType,
      Expires: duration,
    };

    console.log(params, 'put object');

    return await this.s3.getSignedUrlPromise('putObject', params);
  }

  async presignedGetObject(
    bucketName: string,
    objectName: string,
    contentType: string,
    duration: number,
  ): Promise<string> {
    const params = {
      Bucket: bucketName,
      Key: objectName,
      Expires: duration,
    };

    return await this.s3.getSignedUrlPromise('getObject', params);
  }

  async deleteObject(bucketName: string, objectName: string): Promise<void> {
    const params = {
      Bucket: bucketName,
      Key: objectName,
    };

    await this.s3.deleteObject(params).promise();
  }

  async getObject(fileInfo: FileInfo) {
    const params = {
      Bucket: fileInfo.bucketName,
      Key: fileInfo.filepath,
    };

    return await this.s3.getObject(params).promise();
  }

  async putObject(
    bucketName: string,
    objectName: string,
    data: Buffer,
  ): Promise<void> {
    const params = {
      Bucket: bucketName,
      Key: objectName,
      Body: data,
    };

    await this.s3.putObject(params).promise();
  }
}
