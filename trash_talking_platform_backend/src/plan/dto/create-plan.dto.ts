import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({
    example: 'premium',
    description: 'Plan name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Full capabilities',
    description: 'Plan description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: '10.00',
    description: 'Plan price',
  })
  @IsNotEmpty()
  @IsString()
  price: string;

  @ApiProperty({
    example: '365',
    description: 'Plan duration',
  })
  @IsNotEmpty()
  @IsNumber()
  duration: number;
}
