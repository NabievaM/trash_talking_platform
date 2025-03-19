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
} from '@nestjs/common';
import { PlanService } from './plan.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Plan } from './models/plan.model';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { AdminGuard } from '../guards/admin.guard';
import { UserGuard } from '../guards/user.guard';

@ApiTags('Plan')
@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @ApiOperation({ summary: 'Add plan' })
  @ApiResponse({ status: 200, description: 'New Plan', type: Plan })
  @Post('create')
  @UseGuards(AdminGuard)
  create(@Body() createPlanDto: CreatePlanDto) {
    return this.planService.create(createPlanDto);
  }

  @ApiOperation({ summary: 'View all plans' })
  @ApiResponse({
    status: 200,
    description: 'List of plans',
    type: [Plan],
  })
  @Get('all')
  @UseGuards(UserGuard)
  async findAll(): Promise<Plan[]> {
    return this.planService.findAll();
  }

  @ApiOperation({ summary: 'Search plan' })
  @Get('search')
  @UseGuards(UserGuard)
  Find(@Query('name') name: string) {
    return this.planService.search({ name });
  }

  @ApiOperation({ summary: 'View Plan by id' })
  @ApiResponse({ status: 200, description: 'Plan', type: Plan })
  @Get(':id')
  @UseGuards(UserGuard)
  async findById(@Param('id') id: string): Promise<Plan> {
    return this.planService.getById(+id);
  }

  @ApiOperation({ summary: 'Plan edit' })
  @ApiResponse({
    status: 200,
    description: 'Plan updated',
    type: Plan,
  })
  @Put(':id')
  @UseGuards(AdminGuard)
  async updateById(
    @Param('id') id: string,
    @Body() updatePlanDto: UpdatePlanDto,
  ) {
    return this.planService.updateById(+id, updatePlanDto);
  }

  @ApiOperation({ summary: 'Delete Plan' })
  @ApiResponse({
    status: 200,
    description: 'Plan deleted',
    type: Number,
  })
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteById(@Param('id') id: string): Promise<number> {
    return this.planService.deleteById(+id);
  }
}
