import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: 'World',
    description: 'Theme',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example: 'There were 8.09 billion people living in the world.',
    description: 'Description',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
