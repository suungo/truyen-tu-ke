import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Story } from './entities/story.entity';
import { Visit } from './entities/visit.entity';
import { Chapter } from './entities/chapter.entity';
import { StoriesService } from './stories.service';
import { StoriesController } from './stories.controller';
import { StoriesAdminController } from './stories-admin.controller';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { MailService } from 'src/services/mail.service';

import { GenreModule } from '../genre/genre.module';
import { NotificationModule } from '../notification/notification.module';
import { ReaderModule } from '../reader/reader.module';
import { FrameworkModule } from '../framework/framework.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Story, Visit, Chapter]),
    GenreModule,
    NotificationModule,
    ReaderModule,
    FrameworkModule,
  ],
  controllers: [StoriesController, StoriesAdminController],
  providers: [StoriesService, CloudinaryService, MailService],
  exports: [StoriesService],
})
export class StoriesModule {}
