import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { Category } from './models/category.model';
import { Posts } from '../post/models/post.model';

@Module({
  imports: [SequelizeModule.forFeature([Category, Posts]), JwtModule],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
