import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateFollowDto {
  @ApiProperty({
    example: 2,
    description: 'ID of the user being followed',
  })
  @IsNotEmpty()
  @IsNumber()
  following_id: number;
}
