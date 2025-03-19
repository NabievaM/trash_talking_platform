import { Module } from '@nestjs/common';
import { ChallengeEntryService } from './challenge-entry.service';
import { ChallengeEntryController } from './challenge-entry.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { ChallengeEntry } from './models/challenge-entry.model';
import { User } from '../user/models/user.model';
import { Challenge } from '../challenge/models/challenge.model';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [
    SequelizeModule.forFeature([ChallengeEntry, Challenge, User]),
    JwtModule,
    FilesModule,
  ],
  controllers: [ChallengeEntryController],
  providers: [ChallengeEntryService],
  exports: [ChallengeEntryService],
})
export class ChallengeEntryModule {}
