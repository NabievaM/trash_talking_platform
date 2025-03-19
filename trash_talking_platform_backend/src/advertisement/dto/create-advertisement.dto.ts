import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsDateString,
} from 'class-validator';

export class CreateAdvertisementDto {
  @ApiProperty({
    example: 'Coca Cola',
    description: 'Sponsor`s name',
  })
  @IsNotEmpty()
  @IsString()
  sponsor_name: string;

  @ApiProperty({
    example: 'johnanderson@gmail.com',
    description: 'Sponsor`s email',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+998901234567',
    description: 'Sponsor`s phone number',
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty({
    example: 'This is a sponsored advertisement about our new product launch.',
    description: 'The content of the advertisement',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    example: '2025-02-15',
    description:
      'The start date of the advertisement in ISO 8601 format (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @ApiProperty({
    example: '2025-03-15',
    description:
      'The end date of the advertisement in ISO 8601 format (YYYY-MM-DD)',
  })
  @IsNotEmpty()
  @IsDateString()
  end_date: string;
}
