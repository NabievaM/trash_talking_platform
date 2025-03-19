import { Module, forwardRef } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Comment } from './models/comment.model';
import { JwtModule } from '@nestjs/jwt';
import { User } from '../user/models/user.model';
import { Posts } from '../post/models/post.model';
import { Notification } from '../notification/models/notification.model';
import { NotificationGateway } from '../notification/notification.gateway';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Comment, Posts, User, Notification]),
    JwtModule,
    forwardRef(() => NotificationModule),
  ],
  controllers: [CommentController],
  providers: [CommentService, NotificationGateway],
  exports: [CommentService],
})
export class CommentModule {}
