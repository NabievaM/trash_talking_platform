import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { ServeStaticModule } from '@nestjs/serve-static';
import { resolve } from 'path';
import { FilesModule } from './files/files.module';
import { UserModule } from './user/user.module';
import { User } from './user/models/user.model';
import { PostModule } from './post/post.module';
import { Posts } from './post/models/post.model';
import { CommentModule } from './comment/comment.module';
import { Comment } from './comment/models/comment.model';
import { LikeModule } from './like/like.module';
import { Like } from './like/models/like.model';
import { ChallengeModule } from './challenge/challenge.module';
import { Challenge } from './challenge/models/challenge.model';
import { ReportModule } from './report/report.module';
import { Report } from './report/models/report.model';
import { AdvertisementModule } from './advertisement/advertisement.module';
import { Advertisement } from './advertisement/models/advertisement.model';
import { SubscriptionModule } from './subscription/subscription.module';
import { Subscription } from './subscription/models/subscription.model';
import { PlanModule } from './plan/plan.module';
import { Plan } from './plan/models/plan.model';
import { FollowModule } from './follow/follow.module';
import { Follow } from './follow/models/follow.model';
import { ChallengeEntryModule } from './challenge-entry/challenge-entry.module';
import { ChallengeEntry } from './challenge-entry/models/challenge-entry.model';
import { VoteModule } from './vote/vote.module';
import { Vote } from './vote/models/vote.model';
import { NotificationModule } from './notification/notification.module';
import { Notification } from './notification/models/notification.model';
import { NotificationReadersModule } from './notification-readers/notification-readers.module';
import { NotificationReader } from './notification-readers/models/notification-reader.model';
import { StreamModule } from './stream/stream.module';
import { Stream } from './stream/models/stream.model';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: resolve(__dirname, '..', 'uploads'),
    }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +process.env.POSTGRES_PORT,
      username: process.env.POSTGRES_USER,
      password: String(process.env.POSTGRES_PASSWORD),
      database: process.env.POSTGRES_DB,
      models: [
        User,
        Posts,
        Comment,
        Like,
        Challenge,
        Report,
        Advertisement,
        Plan,
        Subscription,
        Follow,
        ChallengeEntry,
        Vote,
        Notification,
        NotificationReader,
        Stream,
      ],
      autoLoadModels: true,
      logging: false,
    }),
    FilesModule,
    UserModule,
    PostModule,
    CommentModule,
    LikeModule,
    ChallengeModule,
    ReportModule,
    AdvertisementModule,
    SubscriptionModule,
    PlanModule,
    FollowModule,
    ChallengeEntryModule,
    VoteModule,
    NotificationModule,
    NotificationReadersModule,
    StreamModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
