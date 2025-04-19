import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './models/category.model';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category)
    private categoryRepository: typeof Category,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = await this.categoryRepository.create(createCategoryDto);
    return category;
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.findAll({ include: { all: true } });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findByPk(id, {
      include: { all: true },
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.findOne(id);
    return await category.update(updateCategoryDto);
  }

  async remove(id: number): Promise<{ message: string }> {
    const category = await this.findOne(id);
    await category.destroy();
    return { message: `Category with ID ${id} has been deleted` };
  }
}
