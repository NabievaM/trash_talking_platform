import { PartialType } from '@nestjs/swagger';
import { CreateNotificationReaderDto } from './create-notification-reader.dto';

export class UpdateNotificationReaderDto extends PartialType(CreateNotificationReaderDto) {}
