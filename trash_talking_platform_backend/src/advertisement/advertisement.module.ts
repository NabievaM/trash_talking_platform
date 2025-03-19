import { Module, forwardRef } from '@nestjs/common';
import { AdvertisementService } from './advertisement.service';
import { AdvertisementController } from './advertisement.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Advertisement } from './models/advertisement.model';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from '../files/files.module';
import { NotificationGateway } from '../notification/notification.gateway';
import { Notification } from '../notification/models/notification.model';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { User } from '../user/models/user.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Advertisement, Notification, User]),
    JwtModule,
    FilesModule,
    forwardRef(() => NotificationModule),
    forwardRef(() => UserModule),
  ],
  controllers: [AdvertisementController],
  providers: [AdvertisementService, NotificationGateway],
  exports: [AdvertisementService],
})
export class AdvertisementModule {}
