import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/models/user.model';

@Table({ tableName: 'streams' })
export class Stream extends Model<Stream> {
  @ApiProperty({
    example: 1,
    description: 'The ID of the user who is streaming',
  })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER })
  streamer_id: number;

  @ApiProperty({
    example: true,
    description: 'Indicates whether the stream is currently active',
  })
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  is_active: boolean;

  @ApiProperty({
    example: '2023-10-31T12:00:00Z',
    description: 'The timestamp when the stream started',
  })
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  started_at: Date;

  @BelongsTo(() => User, 'streamer_id')
  user: User;
}
