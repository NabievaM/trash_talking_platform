import { Module, forwardRef } from '@nestjs/common';
import { NotificationReadersService } from './notification-readers.service';
import { NotificationReadersController } from './notification-readers.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { NotificationReader } from './models/notification-reader.model';
import { Notification } from '../notification/models/notification.model';
import { User } from '../user/models/user.model';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    SequelizeModule.forFeature([NotificationReader, Notification, User]),
    JwtModule,
    forwardRef(() => NotificationModule), 
  ],
  controllers: [NotificationReadersController],
  providers: [NotificationReadersService, NotificationGateway],
  exports: [SequelizeModule],
})
export class NotificationReadersModule {}
