import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { VoteService } from './vote.service';
import { CreateVoteDto } from './dto/create-vote.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserGuard } from '../guards/user.guard';

@ApiTags('Votes')
@Controller('vote')
export class VoteController {
  constructor(private readonly voteService: VoteService) {}

  @ApiOperation({ summary: 'Create a new vote' })
  @ApiResponse({ status: 201, description: 'Vote successfully created.' })
  @ApiResponse({
    status: 403,
    description: 'User cannot vote for own challenge entry.',
  })
  @ApiResponse({ status: 404, description: 'Challenge entry not found.' })
  @Post('create')
  @UseGuards(UserGuard)
  create(@Body() createVoteDto: CreateVoteDto, @Request() req) {
    const userId = req.user.id;
    return this.voteService.create(createVoteDto, userId);
  }

  @ApiOperation({ summary: 'Get all votes' })
  @ApiResponse({
    status: 200,
    description: 'List of votes returned successfully.',
  })
  @Get('all')
  @UseGuards(UserGuard)
  findAll(@Request() req) {
    const userId = req.user.id;
    const isAdmin = req.user.is_admin;
    return this.voteService.findAll(userId, isAdmin);
  }

  @ApiOperation({ summary: 'Get a single vote by ID' })
  @ApiResponse({ status: 200, description: 'Vote found successfully.' })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to view this vote.',
  })
  @ApiResponse({ status: 404, description: 'Vote not found.' })
  @Get(':id')
  @UseGuards(UserGuard)
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    const isAdmin = req.user.is_admin;
    return this.voteService.findOne(+id, userId, isAdmin);
  }

  @ApiOperation({ summary: 'Delete a vote' })
  @ApiResponse({ status: 204, description: 'Vote deleted successfully.' })
  @ApiResponse({
    status: 403,
    description: 'User does not have permission to delete this vote.',
  })
  @ApiResponse({ status: 404, description: 'Vote not found.' })
  @Delete(':id')
  @UseGuards(UserGuard)
  remove(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.voteService.remove(+id, userId);
  }
}
