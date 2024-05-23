import { Module } from '@nestjs/common';
import { StorageModule } from './storage/storage.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    StorageModule,
  ],
})
export class AppModule {}
