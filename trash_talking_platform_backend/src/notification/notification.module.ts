import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { Notification } from './models/notification.model';
import { User } from '../user/models/user.model';
import { NotificationReadersModule } from '../notification-readers/notification-readers.module';
import { PostModule } from '../post/post.module';
import { NotificationReader } from '../notification-readers/models/notification-reader.model';

@Module({
  imports: [
    SequelizeModule.forFeature([
      Notification,
      NotificationReader,
      User,
    ]),
    JwtModule,
    forwardRef(() => NotificationReadersModule),
    forwardRef(() => PostModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway],
  exports: [NotificationService],
})
export class NotificationModule {}
