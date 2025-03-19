import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { StreamService } from './stream.service';
import { UserGuard } from '../guards/user.guard';
import { Stream } from '../stream/models/stream.model';

@ApiTags('Streams')
@Controller('stream')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @ApiOperation({ summary: 'Create a new stream' })
  @ApiResponse({ status: 201, description: 'Stream successfully created' })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post('create')
  async createStream(@Req() req): Promise<any> {
    const streamerId = req.user?.id;
    if (!streamerId) {
      throw new Error('Invalid user');
    }

    return this.streamService.createStream(streamerId);
  }

  @ApiOperation({
    summary: 'Get all active streams',
    description:
      'Retrieve a list of all active streams. Admins see all streams, while users see public streams or streams from users they follow.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active streams.',
    type: [Stream],
  })
  @ApiResponse({ status: 404, description: 'No active streams found.' })
  @UseGuards(UserGuard)
  @Get('all')
  async getAllActiveStreams(@Req() req): Promise<Stream[]> {
    const { id: userId, is_admin: isAdmin } = req.user;

    const streams = await this.streamService.getAllActiveStreams(
      userId,
      isAdmin,
    );

    if (!streams.length) {
      throw new NotFoundException('No active streams found.');
    }

    return streams;
  }

  @ApiOperation({ summary: 'Get active stream of a user' })
  @ApiResponse({ status: 200, description: 'Active stream returned' })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get('active/:userId')
  async getActiveStream(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req,
  ) {
    return this.streamService.getActiveStream(
      userId,
      req.user.id,
      req.user.is_admin,
    );
  }

  @ApiOperation({ summary: 'Get a stream by ID' })
  @ApiResponse({ status: 200, description: 'Stream returned' })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Get(':streamId')
  async getStreamById(
    @Param('streamId', ParseIntPipe) streamId: number,
    @Req() req,
  ) {
    return this.streamService.getStreamById(
      streamId,
      req.user.id,
      req.user.is_admin,
    );
  }

  @ApiOperation({ summary: 'End the active stream of a user' })
  @ApiResponse({ status: 200, description: 'Stream successfully ended' })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Post('end/:streamerId')
  async endStream(
    @Req() req,
    @Param('streamerId', ParseIntPipe) streamerId: number,
  ) {
    return this.streamService.endStream(
      streamerId,
      req.user.id,
      req.user.is_admin,
    );
  }

  @ApiOperation({ summary: 'Get stream stats' })
  @ApiResponse({ status: 200, description: 'Stream stats returned' })
  @ApiResponse({ status: 404, description: 'Stream not found' })
  @ApiResponse({ status: 403, description: 'Access restricted' })
  @UseGuards(UserGuard)
  @Get('stats/:streamId')
  async getStreamStats(@Param('streamId') streamId: number, @Req() req) {
    const isAdmin = req.user?.is_admin || false;
    return this.streamService.getStreamStats(streamId, req.user?.id, isAdmin);
  }

  @ApiOperation({ summary: 'Delete a stream by ID' })
  @ApiResponse({ status: 200, description: 'Stream successfully deleted' })
  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @Delete(':streamId')
  async deleteStream(
    @Param('streamId', ParseIntPipe) streamId: number,
    @Req() req,
  ) {
    return this.streamService.deleteStream(
      streamId,
      req.user.id,
      req.user.is_admin,
    );
  }

  @ApiOperation({ summary: 'Get all streams of a user' })
  @ApiResponse({ status: 200, description: 'User streams returned' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  @UseGuards(UserGuard)
  @Get('user/:userId')
  async getUserStreams(
    @Param('userId', ParseIntPipe) targetUserId: number,
    @Req() req,
  ) {
    const requestingUserId = req.user?.id;
    const isAdmin = req.user?.is_admin;

    return this.streamService.getUserStreams(
      requestingUserId,
      targetUserId,
      isAdmin,
    );
  }
}
