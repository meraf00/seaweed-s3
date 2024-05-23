import { Module } from '@nestjs/common';
import { StorageService } from './services/storage.service';

import { AwsS3 } from './services/aws-s3.service';
import { S3 } from 'aws-sdk';
import { StorageController } from './controllers/storage.controller';
import { S3Client } from './types';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    // Inject AWS Dependency
    {
      provide: S3,
      useFactory: (configService: ConfigService) => {
        return new S3({
          accessKeyId: configService.get('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY'),
          region: configService.get('AWS_REGION'),
          endpoint: configService.get('AWS_ENDPOINT'),
          s3ForcePathStyle: true,
        });
      },
      inject: [ConfigService],
    },

    // Inject S3Facade
    {
      provide: S3Client,
      useClass: AwsS3,
    },
    StorageService,
  ],
  controllers: [StorageController],
  exports: [StorageService],
})
export class StorageModule {}
