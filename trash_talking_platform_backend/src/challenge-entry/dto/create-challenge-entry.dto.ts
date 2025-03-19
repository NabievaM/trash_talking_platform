import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateChallengeEntryDto {
  @ApiPropertyOptional({
    example: 'Roast Battle Showdown',
    description: 'Title of the challenge entry (optional)',
  })
  @IsString()
  text?: string;

  @ApiProperty({
    example: 3,
    description: 'Challenge ID',
  })
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  challenge_id: number;
}
