import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  Put,
  BadRequestException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Challenge } from './models/challenge.model';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { UserGuard } from '../guards/user.guard';

@ApiTags('Challenge')
@Controller('challenge')
export class ChallengeController {
  constructor(private readonly challengeService: ChallengeService) {}

  @ApiOperation({ summary: 'Add challenge' })
  @ApiResponse({ status: 200, description: 'New Challenge', type: Challenge })
  @UseGuards(UserGuard)
  @Post('create')
  create(@Body() createChallengeDto: CreateChallengeDto, @Req() req) {
    return this.challengeService.create(
      createChallengeDto,
      req.user.id,
      req.user.is_admin,
    );
  }

  @ApiOperation({ summary: 'View all challenges' })
  @ApiResponse({
    status: 200,
    description: 'List of challenges',
    type: [Challenge],
  })
  @UseGuards(UserGuard)
  @Get('all')
  async findAll(@Req() req): Promise<Challenge[]> {
    return this.challengeService.findAll(req.user.id, req.user.is_admin);
  }

  @ApiOperation({ summary: 'Search challenge' })
  @Get('search')
  @UseGuards(UserGuard)
  Find(@Query('title') title: string, @Req() req) {
    return this.challengeService.search({ title }, req.user.id);
  }

  @ApiOperation({ summary: 'View Challenge by id' })
  @ApiResponse({ status: 200, description: 'Challenge', type: Challenge })
  @UseGuards(UserGuard)
  @Get(':id')
  async findById(@Param('id') id: string, @Req() req): Promise<Challenge> {
    const challengeId = parseInt(id, 10);
    if (isNaN(challengeId)) {
      throw new BadRequestException('Invalid challenge ID');
    }
    return this.challengeService.getById(challengeId, req.user.id);
  }

  @ApiOperation({ summary: 'Challenge edit' })
  @ApiResponse({
    status: 200,
    description: 'Challenge updated',
    type: Challenge,
  })
  @UseGuards(UserGuard)
  @Put(':id')
  async updateById(
    @Param('id') id: string,
    @Body() updateChallengeDto: UpdateChallengeDto,
    @Req() req,
  ) {
    const challengeId = parseInt(id, 10);
    if (isNaN(challengeId)) {
      throw new BadRequestException('Invalid challenge ID');
    }
    return this.challengeService.updateById(
      challengeId,
      updateChallengeDto,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Delete Challenge' })
  @ApiResponse({
    status: 200,
    description: 'Challenge deleted',
    type: Number,
  })
  @UseGuards(UserGuard)
  @Delete(':id')
  async deleteById(@Param('id') id: string, @Req() req): Promise<number> {
    const challengeId = parseInt(id, 10);
    if (isNaN(challengeId)) {
      throw new BadRequestException('Invalid challenge ID');
    }
    return this.challengeService.deleteById(
      challengeId,
      req.user.id,
      req.user.is_admin,
    );
  }
}
