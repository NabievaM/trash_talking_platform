import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, ValidateIf } from 'class-validator';

export class CreateLikeDto {
  @ApiPropertyOptional({
    example: 5,
    description: 'Post ID if the like is for a post',
  })
  @IsOptional()
  @ValidateIf((o) => !o.commentId)
  @IsInt()
  post_id?: number;

  @ApiPropertyOptional({
    example: 8,
    description: 'Comment ID if the like is for a comment',
  })
  @IsOptional()
  @ValidateIf((o) => !o.postId)
  @IsInt()
  comment_id?: number;
}
