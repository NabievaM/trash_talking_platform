import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum CategoryName {
  SPORTS_BETTING = 'Sports betting',
  FOOTBALL = 'Football',
  VOLLEYBALL = 'Volleyball',
  RUGBY = 'Rugby',
  BASKETBALL = 'Basketball',
  ICE_HOCKEY = 'Ice Hockey',
  BOXING = 'Boxing',
  MMA = 'MMA',
  TENNIS = 'Tennis',
  BASEBALL = 'Baseball',
  GOLF = 'Golf',
  CRICKET = 'Cricket',
  OTHER = 'Other',
}

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    enum: CategoryName,
    example: CategoryName.FOOTBALL,
  })
  @IsNotEmpty()
  @IsEnum(CategoryName, {
    message: 'Category name must be a valid enum value',
  })
  name: CategoryName;
}
