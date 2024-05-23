import { Injectable } from '@nestjs/common';

import { Response } from 'express';
import { FileInfo, S3Client } from '../types';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';

@Injectable()
export class StorageService {
  constructor(
    private readonly s3: S3Client,
    private readonly configService: ConfigService,
  ) {}

  async upload(file: Express.Multer.File, bucketName: string): Promise<any> {
    const normalizedFileName = uuid();

    await this.s3.putObject(bucketName, normalizedFileName, file.buffer);

    return {
      filepath: normalizedFileName,
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
    const normalizedFileName = uuid();

    return await this.s3.presignedPutObject(
      fileInfo.bucketName,
      normalizedFileName,
      fileInfo.contentType,
      Number(this.configService.get<number>('PRESIGNED_URL_EXPIRATION') ?? 120),
    );
  }
}
