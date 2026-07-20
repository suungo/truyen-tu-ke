import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './database/database.config';
import { APP_GUARD } from '@nestjs/core';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { StoriesModule } from './modules/stories/stories.module';
import { GenreModule } from './modules/genre/genre.module';
import { NotificationModule } from './modules/notification/notification.module';
import { ReaderModule } from './modules/reader/reader.module';
import { FrameworkModule } from './modules/framework/framework.module';
import { ImagesModule } from './modules/images/images.module';
import { VideoGeneratorModule } from './modules/video-generator/video-generator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production'
        ? ['.env']
        : ['.env.development', '.env'],
    }),

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: seconds(60),
          limit: 120,
        },
      ],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        getDatabaseConfig(configService),
    }),

    StoriesModule,
    GenreModule,
    NotificationModule,
    ReaderModule,
    FrameworkModule,
    ImagesModule,
    VideoGeneratorModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
