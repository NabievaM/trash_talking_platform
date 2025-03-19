import { PartialType } from '@nestjs/swagger';
import { CreateChallengeEntryDto } from './create-challenge-entry.dto';

export class UpdateChallengeEntryDto extends PartialType(CreateChallengeEntryDto) {}
