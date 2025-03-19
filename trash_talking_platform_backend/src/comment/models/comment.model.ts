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
import { Posts } from '../../post/models/post.model';
import { Like } from '../../like/models/like.model';

interface CommentAttrs {
  content: string;
  user_id: number;
}

@Table({ tableName: 'Comment' })
export class Comment extends Model<Comment, CommentAttrs> {
  @ApiProperty({ example: '1', description: 'Unikal ID' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: '😊👍',
    description: 'Comment',
  })
  @Column({
    type: DataType.STRING,
  })
  content: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Posts)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  post_id: number;

  @BelongsTo(() => Posts)
  post: Posts;

  @HasMany(() => Like)
  likes: Like[];
}
