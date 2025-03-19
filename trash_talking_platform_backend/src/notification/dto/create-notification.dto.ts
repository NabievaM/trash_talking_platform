import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    example: 'System update: New feature released!',
    description: 'The message content of an admin-generated notification.',
  })
  @IsNotEmpty()
  @IsString()
  message: string;
}
