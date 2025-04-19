import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { ApiProperty } from '@nestjs/swagger';
import { CategoryName } from '../dto/create-category.dto';
import { Posts } from '../../post/models/post.model';

@Table({
  tableName: 'categories',
  timestamps: true,
})
export class Category extends Model<Category> {
  @ApiProperty({ example: '1', description: 'Unikal ID' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ApiProperty({
    description: 'The name of the category',
    enum: CategoryName,
    example: CategoryName.BASKETBALL,
  })
  @Column({
    type: DataType.ENUM(...Object.values(CategoryName)),
    allowNull: false,
  })
  name: CategoryName;

  @HasMany(() => Posts)
  posts: Posts[];
}
