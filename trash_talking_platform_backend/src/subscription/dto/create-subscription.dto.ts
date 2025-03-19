import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString } from 'class-validator';

export class CreateSubscriptionDto {
  @ApiProperty({
    example: '2025-02-15',
    description:
      'The start date of the subscription in ISO 8601 format (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @ApiProperty({
    example: '2025-03-15',
    description:
      'The end date of the subscription in ISO 8601 format (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  end_date: string;
}
