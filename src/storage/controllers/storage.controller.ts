import {
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
import { ConfigService } from '@nestjs/config';

@Controller('storage')
export class StorageController {
  constructor(
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  @Get('upload-url')
  async presignedUpload(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    return await this.storageService.generatePresignedUploadUrl({
      bucketName: this.configService.get('AWS_BUCKET_NAME'),
      orginalname: filename,
      contentType: contentType,
    });
  }

  @Get('download-url')
  async getPresignedDownloadUrl(
    @Query('filename') filename: string,
    @Query('contentType') contentType: string,
  ) {
    return await this.storageService.generatePresignedDownloadUrl({
      bucketName: this.configService.get('AWS_BUCKET_NAME'),
      filepath: filename,
      orginalname: filename,
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
        orginalname: query.originalname,
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
