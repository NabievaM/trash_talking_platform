import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ChallengeEntryService } from './challenge-entry.service';
import { CreateChallengeEntryDto } from './dto/create-challenge-entry.dto';
import { UpdateChallengeEntryDto } from './dto/update-challenge-entry.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserGuard } from '../guards/user.guard';
import { ChallengeEntry } from './models/challenge-entry.model';

@ApiTags('Challenge Entry')
@Controller('challenge-entry')
export class ChallengeEntryController {
  constructor(private readonly challengeEntryService: ChallengeEntryService) {}

  @ApiOperation({ summary: 'Create a new challenge entry' })
  @ApiResponse({ status: 201, description: 'Entry successfully created' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Post('create')
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createChallengeEntryDto: CreateChallengeEntryDto,
    @UploadedFile() image: any,
    @Req() req,
  ) {
    return this.challengeEntryService.create(
      createChallengeEntryDto,
      image,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Get all challenge entries' })
  @ApiResponse({ status: 200, description: 'Entries retrieved successfully' })
  @Get('all')
  @UseGuards(UserGuard)
  findAll(@Req() req): Promise<ChallengeEntry[]> {
    return this.challengeEntryService.findAll(req.user.id, req.user.is_admin);
  }

  @ApiOperation({ summary: 'Get a single challenge entry by ID' })
  @ApiResponse({ status: 200, description: 'Entry found' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  @Get(':id')
  @UseGuards(UserGuard)
  findOne(
    @Param('id') id: string,
    @Req() req,
    @Query('isAdmin') isAdmin: boolean,
  ) {
    return this.challengeEntryService.findOne(+id, req.user.id, isAdmin);
  }

  @ApiOperation({ summary: 'Update an existing challenge entry' })
  @ApiResponse({ status: 200, description: 'Entry updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @Put(':id')
  @UseGuards(UserGuard)
  update(
    @Param('id') id: string,
    @Body() updateChallengeEntryDto: UpdateChallengeEntryDto,
    @Req() req,
  ) {
    return this.challengeEntryService.update(
      +id,
      updateChallengeEntryDto,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Delete a challenge entry' })
  @ApiResponse({ status: 200, description: 'Entry deleted successfully' })
  @ApiResponse({ status: 404, description: 'Entry not found' })
  @Delete(':id')
  @UseGuards(UserGuard)
  delete(@Param('id') id: string, @Req() req) {
    return this.challengeEntryService.delete(
      +id,
      req.user.id,
      req.user.is_admin,
    );
  }

  @ApiOperation({ summary: 'Update entry image' })
  @ApiResponse({
    status: 201,
    description: 'Image updated successfully',
    type: [ChallengeEntry],
  })
  @Put('file/:id')
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor('image'))
  updateFile(@Param('id') id: string, @UploadedFile() image: any, @Req() req) {
    return this.challengeEntryService.updateImage(+id, image, req.user.id);
  }
}
