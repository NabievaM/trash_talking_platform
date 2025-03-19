import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataType,
  Table,
  Model,
  ForeignKey,
  BelongsTo,
  BeforeValidate,
} from 'sequelize-typescript';
import { User } from '../../user/models/user.model';
import { Posts } from '../../post/models/post.model';
import { Comment } from '../../comment/models/comment.model';

@Table({
  tableName: 'Like',
  indexes: [
    { unique: true, fields: ['user_id', 'post_id'] },
    { unique: true, fields: ['user_id', 'comment_id'] },
  ],
})
export class Like extends Model<Like> {
  @ApiProperty({ example: 1, description: 'Unique ID' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'User who liked the post or comment',
  })
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  user_id: number;

  @ApiProperty({ example: 5, description: 'Post ID if the like is for a post' })
  @ForeignKey(() => Posts)
  @Column({ type: DataType.INTEGER, allowNull: true })
  post_id?: number;

  @ApiProperty({
    example: 8,
    description: 'Comment ID if the like is for a comment',
  })
  @ForeignKey(() => Comment)
  @Column({ type: DataType.INTEGER, allowNull: true })
  comment_id?: number;

  @BelongsTo(() => User)
  user: User;

  @BelongsTo(() => Posts)
  post: Posts;

  @BelongsTo(() => Comment)
  comment: Comment;

  @BeforeValidate
  static validateLike(instance: Like) {
    if (!instance.post_id && !instance.comment_id) {
      throw new Error('Either post_id or comment_id must be provided.');
    }
    if (instance.post_id && instance.comment_id) {
      throw new Error('Only one of post_id or comment_id can be provided.');
    }
  }
}
