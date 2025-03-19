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
import { NotificationReader } from '../../notification-readers/models/notification-reader.model';

interface NotificationAttrs {
  user_id: number;
  message: string;
}

@Table({ tableName: 'notifications' })
export class Notification extends Model<Notification, NotificationAttrs> {
  @ApiProperty({ example: 1, description: 'Unikal ID' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 'System update: New feature released!',
    description: 'The message content of an admin-generated notification.',
  })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  message: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => NotificationReader)
  notificationReaders: NotificationReader[];
}
