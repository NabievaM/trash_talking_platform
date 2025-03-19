import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    example: '😊👍',
    description: 'Comment',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    example: 1,
    description: 'Post id',
  })
  @IsNotEmpty()
  @IsNumber()
  post_id: number;
}
