import { Module } from '@nestjs/common';

import { S3Client } from '@aws-sdk/client-s3';

import { StorageService } from './services/storage.service';
import { AwsS3 } from './services/aws-s3.service';
import { S3 } from './types';

import { StorageController } from './controllers/storage.controller';

@Module({
  providers: [
    // Inject AWS Dependency
    {
      provide: S3Client,
      useFactory: () => {
        return new S3Client({
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
          endpoint: process.env.AWS_ENDPOINT,
          forcePathStyle: true,
        });
      },
    },

    // Inject S3
    {
      provide: S3,
      useClass: AwsS3,
    },

    StorageService,
  ],
  controllers: [StorageController],
  exports: [StorageService],
})
export class StorageModule {}
