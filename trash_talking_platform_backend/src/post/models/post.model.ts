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
import { Comment } from '../../comment/models/comment.model';
import { Like } from '../../like/models/like.model';
import { Category } from '../../category/models/category.model';

interface PostAttrs {
  title: string;
  content: string;
  image?: string;
  user_id: number;
  category_id: number;
}

@Table({ tableName: 'Posts' })
export class Posts extends Model<Posts, PostAttrs> {
  @ApiProperty({ example: '1', description: 'Unikal ID' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({ example: 'World', description: 'Theme' })
  @Column({
    type: DataType.STRING,
  })
  title: string;

  @ApiProperty({
    example: 'There were 8.09 billion people living in the world.',
    description: 'Description',
  })
  @Column({
    type: DataType.STRING,
  })
  content: string;

  @ApiProperty({
    example: 'image.jpg',
    description: 'New post',
  })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  image: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  user_id: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Category)
  @Column({ type: DataType.INTEGER, allowNull: false })
  category_id: number;

  @BelongsTo(() => Category)
  category: Category;

  @HasMany(() => Comment)
  comments: Comment[];

  @HasMany(() => Like)
  likes: Like[];
}
