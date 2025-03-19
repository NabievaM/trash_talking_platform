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
  SetMetadata,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Report } from './models/report.model';
import { AdminGuard } from '../guards/admin.guard';
import { UserGuard } from '../guards/user.guard';
import { OwnerOrAdminGuard } from '../guards/owner-or-admin.guard';

@ApiTags('Report')
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @ApiOperation({ summary: 'Add Report' })
  @ApiResponse({ status: 200, description: 'New Report', type: Report })
  @Post('create')
  @UseGuards(UserGuard)
  async create(@Body() createReportDto: CreateReportDto, @Req() req) {
    const reportData: CreateReportDto & { reported_by: string } = {
      ...createReportDto,
      reported_by: req.user.id,
    };

    return this.reportService.create(reportData);
  }

  @ApiOperation({ summary: 'View all reports' })
  @ApiResponse({ status: 200, description: 'List of reports', type: [Report] })
  @Get('all')
  @UseGuards(AdminGuard)
  async findAll(): Promise<Report[]> {
    return this.reportService.findAll();
  }

  @ApiOperation({ summary: 'Search Report' })
  @Get('search')
  @UseGuards(AdminGuard)
  Find(
    @Query('reported_by') reported_by: string,
    @Query('reported_user') reported_user: string,
  ) {
    return this.reportService.search({ reported_by, reported_user });
  }

  @ApiOperation({ summary: 'View Report by id' })
  @ApiResponse({ status: 200, description: 'Report details', type: Report })
  @Get(':id')
  @UseGuards(OwnerOrAdminGuard)
  @SetMetadata('model', Report)
  async findById(@Param('id') id: string): Promise<Report> {
    return this.reportService.getById(+id);
  }

  @ApiOperation({ summary: 'Update Report' })
  @ApiResponse({ status: 200, description: 'Report updated', type: Report })
  @Put(':id')
  @UseGuards(OwnerOrAdminGuard)
  @SetMetadata('model', Report)
  async updateById(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    return this.reportService.updateById(+id, updateReportDto);
  }

  @ApiOperation({ summary: 'Delete Report' })
  @ApiResponse({ status: 200, description: 'Report deleted', type: Number })
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteById(@Param('id') id: string): Promise<number> {
    return this.reportService.deleteById(+id);
  }
}
