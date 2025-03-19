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

interface ReportAttrs {
  reported_by: number;
  reported_user: number;
  reason: string;
  status: string;
}

@Table({ tableName: 'reports' }) 
export class Report extends Model<Report, ReportAttrs> {
  @ApiProperty({ example: 1, description: 'Unique ID of the report' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 1, description: 'ID of the user who submitted the report' })
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false, 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  reported_by: number;

  @ApiProperty({ example: 2, description: 'ID of the user being reported' })
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false, 
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  reported_user: number;

  @ApiProperty({
    example: 'This user is being toxic and offensive.',
    description: 'Reason for the report',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  reason: string;

  @ApiProperty({
    example: 'pending',
    description: 'Current status of the report',
    enum: ['pending', 'reviewed', 'resolved', 'rejected'],
  })
  @Column({
    type: DataType.ENUM('pending', 'reviewed', 'resolved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
  })
  status: string;

  @BelongsTo(() => User, { foreignKey: 'reported_by', as: 'reporter' })
  reporter: User;

  @BelongsTo(() => User, { foreignKey: 'reported_user', as: 'reported' })
  reported: User;
}
