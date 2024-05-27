import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from '../services/storage.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload-url')
  async presignedUpload(
    @Body('filename') filename: string,
    @Body('contentType') contentType: string,
  ) {
    return await this.storageService.generatePresignedUploadUrl({
      bucketName: process.env.AWS_BUCKET_NAME,
      originalname: filename,
      contentType: contentType,
    });
  }

  @Post('download-url')
  async getPresignedDownloadUrl(
    @Body('filename') filename: string,
    @Body('contentType') contentType: string,
  ) {
    return await this.storageService.generatePresignedDownloadUrl({
      bucketName: process.env.AWS_BUCKET_NAME,
      filepath: filename,
      originalname: filename,
      contentType: contentType,
    });
  }

  @Get('download')
  async downloadFile(@Query() query, @Res() response: ExpressResponse) {
    const result = await this.storageService.download(
      {
        bucketName: query.bucketName,
        filepath: query.filename,
        contentType: query.contentType,
        originalname: query.originalname,
      },
      response,
    );

    return response.send(result);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.storageService.upload(file, process.env.AWS_BUCKET_NAME);
  }
}
