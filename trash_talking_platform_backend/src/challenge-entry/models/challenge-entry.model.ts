import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Challenge } from '../../challenge/models/challenge.model';
import { User } from '../../user/models/user.model';
import { Vote } from '../../vote/models/vote.model';

interface ChallengeEntryAttrs {
  text?: string;
  image?: string;
  challenge_id: number;
  user_id?: number;
}

@Table({ tableName: 'ChallengeEntries' })
export class ChallengeEntry extends Model<ChallengeEntry, ChallengeEntryAttrs> {
  @ApiProperty({ example: 1, description: 'Unique ID of the challenge entry' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiPropertyOptional({
    example: 'Roast Battle Showdown',
    description: 'Title of the challenge entry (optional)',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  text?: string;

  @ApiPropertyOptional({
    example: 'image.jpg',
    description: 'Image URL for the challenge entry (optional)',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image?: string;

  @ApiProperty({
    example: 3,
    description: 'ID of the related challenge',
  })
  @ForeignKey(() => Challenge)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  challenge_id: number;

  @BelongsTo(() => Challenge, { foreignKey: 'challenge_id', targetKey: 'id' })
  challenge: Challenge;

  @ApiPropertyOptional({
    example: 7,
    description: 'ID of the user who submitted the entry (optional)',
  })
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  user_id?: number;

  @BelongsTo(() => User, { foreignKey: 'user_id', targetKey: 'id' })
  user: User;

  @HasMany(() => Vote)
  votes: Vote[];
}
