import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Notification } from './models/notification.model';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { UserGuard } from '../guards/user.guard';
import { AdminGuard } from '../guards/admin.guard';

@ApiTags('Notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({ summary: 'Add notification' })
  @ApiResponse({
    status: 200,
    description: 'New Notification',
    type: Notification,
  })
  @UseGuards(AdminGuard)
  @Post('create')
  create(@Body() createNotificationDto: CreateNotificationDto, @Req() req) {
    return this.notificationService.create(createNotificationDto, req.user.id);
  }

  @ApiOperation({ summary: 'View all notifications' })
  @ApiResponse({
    status: 200,
    description: 'List of notifications',
    type: [Notification],
  })
  @UseGuards(UserGuard)
  @Get('all')
  async findAll(@Req() req): Promise<Notification[]> {
    const isAdmin = req.user?.is_admin ?? false;

    return this.notificationService.findAll(isAdmin);
  }

  @ApiOperation({ summary: 'View Notification by id' })
  @ApiResponse({ status: 200, description: 'Notification', type: Notification })
  @UseGuards(UserGuard)
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req): Promise<Notification> {
    const isAdmin = req.user?.is_admin ?? false;
    return this.notificationService.getById(+id, isAdmin);
  }

  @ApiOperation({ summary: 'Notification edit' })
  @ApiResponse({
    status: 200,
    description: 'Notification updated',
    type: Notification,
  })
  @UseGuards(AdminGuard)
  @Put(':id')
  async updateById(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationDto,
    @Req() req,
  ) {
    const notificationId = parseInt(id, 10);
    if (isNaN(notificationId)) {
      throw new BadRequestException('Invalid notification ID');
    }
    return this.notificationService.updateById(
      notificationId,
      updateNotificationDto,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Delete Notification' })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted',
    type: Number,
  })
  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteById(@Param('id') id: string, @Req() req): Promise<number> {
    const notificationId = parseInt(id, 10);
    if (isNaN(notificationId)) {
      throw new BadRequestException('Invalid notification ID');
    }
    return this.notificationService.deleteById(notificationId, req.user.id);
  }
}
