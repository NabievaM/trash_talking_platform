import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateVoteDto {
  @ApiProperty({
    description: 'The ID of the challenge entry being voted for',
    example: 3,
  })
  @IsNotEmpty()
  challenge_entry_id: number;
}
