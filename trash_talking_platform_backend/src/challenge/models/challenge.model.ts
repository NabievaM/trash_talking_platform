import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { ChallengeEntry } from '../../challenge-entry/models/challenge-entry.model';

export enum ChallengeStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

interface ChallengeAttrs {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status?: ChallengeStatus;
  reward?: string;
  winner_id?: number | null;
  user_id?: number;
}

@Table({ tableName: 'Challenge' })
export class Challenge extends Model<Challenge, ChallengeAttrs> {
  @ApiProperty({ example: '1', description: 'Unikal ID' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 'Fastest Roaster!',
    description: 'Challenge title',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @ApiProperty({
    example: 'Roast your opponent with the best joke!',
    description: 'Challenge description',
  })
  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @ApiProperty({
    example: '2025-03-01T12:00:00.000Z',
    description: 'Challenge start date',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  start_date: string;

  @ApiProperty({
    example: '2025-03-10T12:00:00.000Z',
    description: 'Challenge end date',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  end_date: string;

  @ApiProperty({
    example: 'pending',
    description: 'Challenge status (pending, active, completed)',
  })
  @Column({
    type: DataType.ENUM(...Object.values(ChallengeStatus)),
    allowNull: false,
    defaultValue: ChallengeStatus.PENDING,
  })
  status: ChallengeStatus;

  @ApiProperty({
    example: 'Premium Subscription for 1 month',
    description: 'Reward for winner (optional)',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  reward?: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  winner_id: number | null;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  user_id?: number;

  @BelongsTo(() => User, { foreignKey: 'user_id', targetKey: 'id' })
  user: User;

  @BelongsTo(() => User, { foreignKey: 'winner_id', targetKey: 'id' })
  winner: User;

  @HasMany(() => ChallengeEntry)
  challengeEntry: ChallengeEntry[];
}
