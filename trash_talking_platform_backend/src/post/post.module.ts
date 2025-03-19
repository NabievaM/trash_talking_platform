import { Module, forwardRef } from '@nestjs/common';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Posts } from './models/post.model';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/models/user.model';
import { FilesModule } from '../files/files.module';
import { UserModule } from '../user/user.module';
import { FollowModule } from '../follow/follow.module';
import { NotificationModule } from '../notification/notification.module';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationReader } from '../notification-readers/models/notification-reader.model';
import { Notification } from '../notification/models/notification.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Posts, User, Notification, NotificationReader]),
    JwtModule,
    FilesModule,
    forwardRef(() => UserModule),
    forwardRef(() => FollowModule),
    forwardRef(() => NotificationModule),
  ],
  controllers: [PostController],
  providers: [PostService, NotificationGateway],
  exports: [PostService],
})
export class PostModule {}
