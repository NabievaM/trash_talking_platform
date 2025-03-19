import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateReportDto {
  @ApiProperty({ example: 2, description: 'ID of the user being reported' })
  @IsNotEmpty()
  @IsNumber()
  reported_user: number;

  @ApiProperty({
    example: 'This user is being toxic and offensive.',
    description: 'Reason for the report',
  })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
