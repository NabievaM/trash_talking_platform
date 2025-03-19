import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsDateString,
  IsOptional,
  IsEnum,
  IsInt,
} from 'class-validator';

export enum ChallengeStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

export class CreateChallengeDto {
  @ApiProperty({
    example: 'Roast Battle Showdown',
    description: 'Challenge name',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    example:
      'Compete against other users in a friendly roast battle! Drop your wittiest and funniest comebacks, and let the community decide who the ultimate trash talk champion is.🔥',
    description: 'Description',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: '2025-02-20T12:00:00.000Z',
    description: 'Start date of the event',
  })
  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @ApiProperty({
    example: '2025-02-21T12:00:00.000Z',
    description: 'End date of the event',
  })
  @IsNotEmpty()
  @IsDateString()
  end_date: string;

  @ApiProperty({
    example: 'pending',
    description: 'Status of the challenge',
    enum: ChallengeStatus,
  })
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;

  @ApiProperty({
    example: 3,
    description:
      'Winner user ID (Nullable, only set when challenge is completed)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  winner_id?: number;

  @ApiProperty({
    example: 'Premium Subscription for 1 month',
    description: 'Reward for winner (optional)',
  })
  @IsOptional()
  @IsString()
  reward?: string;
}
