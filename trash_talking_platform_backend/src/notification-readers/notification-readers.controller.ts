import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationReadersService } from './notification-readers.service';
import { CreateNotificationReaderDto } from './dto/create-notification-reader.dto';
import { UserGuard } from '../guards/user.guard';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Notification Readers')
@ApiBearerAuth()
@Controller('notification-readers')
export class NotificationReadersController {
  constructor(
    private readonly notificationReadersService: NotificationReadersService,
  ) {}

  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 201, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @UseGuards(UserGuard)
  @Post('create')
  markAsRead(
    @Body() createNotificationReaderDto: CreateNotificationReaderDto,
    @Req() req,
  ) {
    return this.notificationReadersService.markAsRead(
      createNotificationReaderDto,
      req.user.id,
    );
  }

  @ApiOperation({
    summary: 'Get unread notifications for the authenticated user',
  })
  @UseGuards(UserGuard)
  @Get('unread')
  @ApiResponse({ status: 200, description: 'List of unread notifications' })
  getUnreadNotifications(@Req() req) {
    return this.notificationReadersService.getUnreadNotifications(req.user.id);
  }

  @ApiOperation({
    summary: 'Get all notifications read by the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'List of notification readers' })
  @UseGuards(UserGuard)
  @Get('all')
  findAll(@Req() req) {
    return this.notificationReadersService.findAll(req.user.id);
  }

  @ApiOperation({
    summary: 'Delete a notification reader for the authenticated user',
  })
  @ApiResponse({ status: 200, description: 'Notification reader deleted' })
  @ApiResponse({ status: 404, description: 'Notification reader not found' })
  @ApiParam({ name: 'id', type: Number, description: 'Notification reader ID' })
  @UseGuards(AdminGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationReadersService.remove(+id);
  }
}
