import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '../stories/entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  providers: [NotificationsGateway],
  exports: [TypeOrmModule, NotificationsGateway],
})
export class NotificationModule {}
