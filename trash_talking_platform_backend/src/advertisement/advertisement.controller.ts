import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  HttpCode,
  HttpStatus,
  Put,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdvertisementService } from './advertisement.service';
import { CreateAdvertisementDto } from './dto/create-advertisement.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Advertisement } from './models/advertisement.model';
import { UpdateAdvertisementDto } from './dto/update-advertisement.dto';
import { AdminGuard } from '../guards/admin.guard';
import { UserGuard } from '../guards/user.guard';

@ApiTags('Advertisement')
@Controller('advertisement')
export class AdvertisementController {
  constructor(private readonly advertisementService: AdvertisementService) {}

  @ApiOperation({ summary: 'Add Advertisement' })
  @ApiResponse({
    status: 200,
    description: 'New Advertisement',
    type: [Advertisement],
  })
  @Post('create')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createAdvertisementDto: CreateAdvertisementDto,
    @UploadedFile() image: any,
  ) {
    return this.advertisementService.create(createAdvertisementDto, image);
  }

  @ApiOperation({ summary: 'View all advertisement' })
  @ApiResponse({
    status: 200,
    description: 'List of advertisements',
    type: [Advertisement],
  })
  @Get('all')
  @UseGuards(UserGuard)
  async findAll(): Promise<Advertisement[]> {
    return this.advertisementService.findAll();
  }

  @ApiOperation({ summary: 'Search Advertisement' })
  @Get('search')
  @UseGuards(UserGuard)
  Find(@Query('sponsor_name') sponsor_name: string) {
    return this.advertisementService.search({ sponsor_name });
  }

  @ApiOperation({ summary: 'View Advertisement by id' })
  @ApiResponse({
    status: 200,
    description: 'Advertisement',
    type: Advertisement,
  })
  @Get(':id')
  @UseGuards(UserGuard)
  async findById(@Param('id') id: string): Promise<Advertisement> {
    return this.advertisementService.GetById(+id);
  }

  @ApiOperation({ summary: 'Advertisement edit' })
  @ApiResponse({
    status: 200,
    description: 'Advertisement by Id',
    type: [Advertisement],
  })
  @Put(':id')
  @UseGuards(AdminGuard)
  async updateById(
    @Param('id') id: string,
    @Body() updateAdvertisementDto: UpdateAdvertisementDto,
  ) {
    return this.advertisementService.updateById(+id, updateAdvertisementDto);
  }

  @ApiOperation({ summary: 'Image update' })
  @ApiResponse({
    status: 201,
    description: 'update image by id',
    type: [Advertisement],
  })
  @HttpCode(HttpStatus.OK)
  @Put('file/:id')
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('image'))
  updateFile(@Param('id') id: string, @UploadedFile() image: any) {
    return this.advertisementService.updateImage(+id, image);
  }

  @ApiOperation({ summary: 'Delete Advertisement' })
  @ApiResponse({
    status: 200,
    description: 'Deleted Advertisement',
    type: [Advertisement],
  })
  @Delete(':id')
  @UseGuards(AdminGuard)
  async deleteById(@Param('id') id: string): Promise<number> {
    return this.advertisementService.deleteById(+id);
  }
}
