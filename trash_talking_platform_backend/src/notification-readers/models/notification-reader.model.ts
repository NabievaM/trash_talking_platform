import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { Notification } from '../../notification/models/notification.model';
import { User } from '../../user/models/user.model';

@Table({ tableName: 'notification_readers' })
export class NotificationReader extends Model {
  @ApiProperty({
    example: 1,
    description: 'The ID of the notification being read.',
  })
  @ForeignKey(() => Notification)
  @Column({ allowNull: false })
  notification_id: number;

  @ApiProperty({
    example: 5,
    description: 'The ID of the user who read the notification.',
  })
  @ForeignKey(() => User)
  @Column({ allowNull: false })
  user_id: number;

  @ApiProperty({
    example: false,
    description:
      'Indicates whether the notification has been read. Default is false.',
  })
  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  is_read: boolean;

  @BelongsTo(() => Notification)
  notification: Notification;

  @BelongsTo(() => User)
  user: User;
}
