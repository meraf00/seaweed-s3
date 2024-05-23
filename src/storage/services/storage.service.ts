import { Injectable } from '@nestjs/common';

import { Response } from 'express';
import { FileInfo, S3Client } from '../types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  constructor(
    private readonly s3: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async upload(file: Express.Multer.File, bucketName: string): Promise<any> {
    const name = String(Date.now());

    await this.s3.putObject(bucketName, name, file.buffer);

    return {
      filepath: name,
      bucketName,
      contentType: file.mimetype,
      orginalname: file.originalname,
    };
  }

  async download(fileInfo: FileInfo, response: Response): Promise<any> {
    const result = await this.s3.getObject(fileInfo);

    response.setHeader('Content-Type', fileInfo.contentType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileInfo.orginalname ?? fileInfo.filepath}`,
    );
    result.pipe(response);

    return result;
  }

  async generatePresignedDownloadUrl(fileInfo: FileInfo) {
    return await this.s3.presignedGetObject(
      fileInfo.bucketName,
      fileInfo.filepath,
      fileInfo.contentType,
      Number(this.configService.get<number>('PRESIGNED_URL_EXPIRATION') ?? 120),
    );
  }

  async generatePresignedUploadUrl(fileInfo: FileInfo) {
    const name = String(Date.now());

    return await this.s3.presignedPutObject(
      fileInfo.bucketName,
      name,
      fileInfo.contentType,
      Number(this.configService.get<number>('PRESIGNED_URL_EXPIRATION') ?? 120),
    );
  }
}
