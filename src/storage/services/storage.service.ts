import { Injectable } from '@nestjs/common';

import { Response } from 'express';
import { FileInfo, S3 } from '../types';
import { randomUUID } from 'crypto';
import { extname } from 'path';

@Injectable()
export class StorageService {
  constructor(private readonly s3: S3) {}

  async upload(
    file: Express.Multer.File,
    bucketName: string,
  ): Promise<FileInfo> {
    const ext = extname(file.originalname);

    const normalizedFileName = `${randomUUID()}${ext}`;

    await this.s3.putObject(bucketName, normalizedFileName, file.buffer);

    return {
      filepath: normalizedFileName,
      bucketName,
      contentType: file.mimetype,
      originalname: file.originalname,
    };
  }

  async download(fileInfo: FileInfo, response: Response): Promise<any> {
    const result = await this.s3.getObject(
      fileInfo.bucketName,
      fileInfo.filepath,
    );

    response.setHeader('Content-Type', fileInfo.contentType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileInfo.originalname ?? fileInfo.filepath}`,
    );

    return result;
  }

  async generatePresignedDownloadUrl(fileInfo: FileInfo) {
    return await this.s3.presignedGetObject(
      fileInfo.bucketName,
      fileInfo.filepath,
      fileInfo.contentType,
      +process.env.PRESIGNED_URL_EXPIRATION,
    );
  }

  async generatePresignedUploadUrl(fileInfo: FileInfo) {
    const ext = extname(fileInfo.originalname);

    const normalizedFileName = `${randomUUID()}${ext}`;

    return await this.s3.presignedPutObject(
      fileInfo.bucketName,
      normalizedFileName,
      fileInfo.contentType,
      +process.env.PRESIGNED_URL_EXPIRATION,
    );
  }
}
