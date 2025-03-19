import { ApiProperty } from '@nestjs/swagger';
import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ChallengeEntry } from '../../challenge-entry/models/challenge-entry.model';
import { User } from '../../user/models/user.model';

@Table({
  tableName: 'votes',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'challenge_entry_id'],
    },
  ],
})
export class Vote extends Model<Vote> {
  @ApiProperty({
    description: 'Unique identifier for the vote',
    example: 1,
  })
  @Column({ autoIncrement: true, primaryKey: true })
  id: number;

  @ApiProperty({
    description: 'The user who cast the vote',
    example: { id: 42, username: 'john_doe' },
  })
  @ForeignKey(() => User)
  @Column
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @ApiProperty({
    description: 'The challenge entry that received the vote',
    example: { id: 123, title: 'Best Design' },
  })
  @ForeignKey(() => ChallengeEntry)
  @Column
  challenge_entry_id: number;

  @BelongsTo(() => ChallengeEntry)
  challengeEntry: ChallengeEntry;
}
