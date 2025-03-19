import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from '../files/files.module';
import { PostModule } from '../post/post.module';
import { ChallengeModule } from '../challenge/challenge.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    JwtModule,
    FilesModule,
    forwardRef(() => PostModule),
    forwardRef(() => ChallengeModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
