import { Module, forwardRef } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Like } from './models/like.model';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/models/user.model';
import { Posts } from '../post/models/post.model';
import { Comment } from '../comment/models/comment.model';
import { Notification } from '../notification/models/notification.model';
import { NotificationModule } from '../notification/notification.module';
import { NotificationGateway } from '../notification/notification.gateway';

@Module({
  imports: [
    SequelizeModule.forFeature([Like, User, Posts, Comment, Notification]),
    JwtModule,
    forwardRef(() => NotificationModule),
  ],
  controllers: [LikeController],
  providers: [LikeService, NotificationGateway],
  exports: [LikeService],
})
export class LikeModule {}
