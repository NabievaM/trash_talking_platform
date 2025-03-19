import { forwardRef, Module } from '@nestjs/common';
import { StreamGateway } from './stream.gateway';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';
import { Stream } from './models/stream.model';
import { User } from '../user/models/user.model';
import { Follow } from '../follow/models/follow.model';
import { NotificationGateway } from '../notification/notification.gateway';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Stream, User, Follow]),
    JwtModule,
    forwardRef(() => UserModule),
  ],
  controllers: [StreamController],
  providers: [StreamService, StreamGateway, NotificationGateway],
  exports: [StreamService],
})
export class StreamModule {}
