import { ApiProperty } from '@nestjs/swagger';
import { Column, DataType, Table, Model, HasMany } from 'sequelize-typescript';
import { Subscription } from '../../subscription/models/subscription.model';

interface PlanAttrs {
  name: string;
  description: string;
  price: string;
  duration: number;
}

@Table({ tableName: 'Plan' })
export class Plan extends Model<Plan, PlanAttrs> {
  @ApiProperty({ example: 1, description: 'Unikal ID' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'Premium', description: 'Plan name' })
  @Column({
    type: DataType.STRING,
    unique: true,
  })
  name: string;

  @ApiProperty({
    example: 'Full capabilities',
    description: 'Plan description',
  })
  @Column({
    type: DataType.TEXT,
  })
  description: string;

  @ApiProperty({
    example: '100$',
    description: 'Plan Price',
  })
  @Column({
    type: DataType.STRING,
  })
  price: string;

  @ApiProperty({
    example: '365',
    description: 'Plan duration',
  })
  @Column({
    type: DataType.INTEGER,
  })
  duration: number;

  @HasMany(() => Subscription)
  subscriptions: Subscription[];
}
