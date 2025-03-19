import { Module } from '@nestjs/common';
import { VoteService } from './vote.service';
import { VoteController } from './vote.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Vote } from './models/vote.model';
import { User } from '../user/models/user.model';
import { ChallengeEntry } from '../challenge-entry/models/challenge-entry.model';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    SequelizeModule.forFeature([Vote, User, ChallengeEntry]),
    JwtModule,
  ],
  controllers: [VoteController],
  providers: [VoteService],
  exports: [VoteService],
})
export class VoteModule {}
