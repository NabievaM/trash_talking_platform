import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Put,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Subscription } from './models/subscription.model';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { AdminGuard } from '../guards/admin.guard';
import { UserGuard } from '../guards/user.guard';
import { OwnerOrAdminGuard } from '../guards/owner-or-admin.guard';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @ApiOperation({ summary: 'Add Subscription' })
  @ApiResponse({
    status: 201,
    description: 'Subscription created successfully',
    type: Subscription,
  })
  @Post('create')
  @UseGuards(UserGuard)
  async create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @Req() req,
  ) {
    return this.subscriptionService.create(req.user.id, createSubscriptionDto);
  }

  @ApiOperation({ summary: 'View all subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'List of subscriptions',
    type: [Subscription],
  })
  @Get('all')
  @UseGuards(AdminGuard)
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionService.findAll();
  }

  @ApiOperation({ summary: 'Search Subscriptions' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    type: [Subscription],
  })
  @Get('search')
  @UseGuards(AdminGuard)
  async search(
    @Query('start_date') start_date?: string,
    @Query('end_date') end_date?: string,
    @Query('plan_name') plan_name?: string,
  ) {
    return this.subscriptionService.search({ start_date, end_date, plan_name });
  }

  @ApiOperation({ summary: 'View Subscription by ID' })
  @ApiResponse({
    status: 200,
    description: 'Subscription details',
    type: Subscription,
  })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @UseGuards(OwnerOrAdminGuard)
  @SetMetadata('model', Subscription)
  async findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update Subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription updated successfully',
    type: Subscription,
  })
  @Put(':id')
  @UseGuards(OwnerOrAdminGuard)
  @SetMetadata('model', Subscription)
  async update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.update(+id, updateSubscriptionDto);
  }

  @ApiOperation({ summary: 'Delete Subscription' })
  @ApiResponse({
    status: 200,
    description: 'Subscription deleted successfully',
  })
  @Delete(':id')
  @UseGuards(OwnerOrAdminGuard)
  @SetMetadata('model', Subscription)
  async remove(@Param('id') id: string) {
    return this.subscriptionService.deleteById(+id);
  }
}
