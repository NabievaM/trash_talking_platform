import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { Plan } from '../../plan/models/plan.model';

interface SubscriptionAttrs {
  start_date: string;
  end_date: string;
  is_active?: boolean;
  user_id: number;
}

@Table({ tableName: 'Subscription' })
export class Subscription extends Model<Subscription, SubscriptionAttrs> {
  @ApiProperty({ example: '1', description: 'Unikal ID' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: '2025-03-01T12:00:00.000Z',
    description: 'Subscription start date',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  start_date: String;

  @ApiProperty({
    example: '2025-03-10T12:00:00.000Z',
    description: 'Subscription end date',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  end_date: String;

  @ApiProperty({ example: true, description: 'Subscription`s activity status' })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  is_active: boolean;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Plan)
  @Column({
    type: DataType.INTEGER,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  plan_id: number;

  @BelongsTo(() => Plan)
  plan: Plan;
}
