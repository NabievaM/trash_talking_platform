import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt, IsOptional } from 'class-validator';

export class CreateNotificationReaderDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the user who is marking the notification as read.',
  })
  @IsNotEmpty()
  @IsInt()
  @IsOptional()
  user_id: number;

  @ApiProperty({
    example: 1,
    description: 'The ID of the notification being marked as read.',
  })
  @IsNotEmpty()
  @IsInt()
  notification_id: number;
}
