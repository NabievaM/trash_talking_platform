import { Module, forwardRef } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ChallengeController } from './challenge.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Challenge } from './models/challenge.model';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/models/user.model';
import { Notification } from '../notification/models/notification.model';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationModule } from '../notification/notification.module';
import { UserModule } from '../user/user.module';
import { FollowModule } from '../follow/follow.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Challenge, User, Notification]),
    JwtModule,
    forwardRef(() => NotificationModule),
    forwardRef(() => UserModule),
    forwardRef(() => FollowModule),
  ],
  controllers: [ChallengeController],
  providers: [ChallengeService, NotificationGateway],
  exports: [ChallengeService],
})
export class ChallengeModule {}
