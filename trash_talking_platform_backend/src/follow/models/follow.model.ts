import { ApiProperty } from '@nestjs/swagger';
import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  Default,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';

@Table({ tableName: 'follows', timestamps: true })
export class Follow extends Model<Follow> {
  @ApiProperty({ description: 'Follower user ID', example: 1 })
  @ForeignKey(() => User)
  @Column({ allowNull: false })
  follower_id: number;

  @ApiProperty({ description: 'Following user ID', example: 2 })
  @ForeignKey(() => User)
  @Column({ allowNull: false })
  following_id!: number;

  @ApiProperty({
    description: "Follow status ('pending' or 'accepted')",
    example: 'pending',
  })
  @Default('pending')
  @Column
  status!: 'pending' | 'accepted';

  @BelongsTo(() => User, { foreignKey: 'follower_id', as: 'follower' })
  follower!: User;

  @BelongsTo(() => User, { foreignKey: 'following_id', as: 'following' })
  following!: User;
}
