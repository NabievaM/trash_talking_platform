import { Module, forwardRef } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Follow } from './models/follow.model';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/models/user.model';
import { Notification } from '../notification/models/notification.model';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationModule } from '../notification/notification.module';
// import { StreamGateway } from '../stream/stream.gateway';
import { StreamModule } from '../stream/stream.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Follow, User, Notification]),
    JwtModule,
    forwardRef(() => NotificationModule),
    forwardRef(() => StreamModule),
  ],
  controllers: [FollowController],
  providers: [FollowService, NotificationGateway],
  exports: [FollowService],
})
export class FollowModule {}
