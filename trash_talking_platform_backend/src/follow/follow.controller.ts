import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  Req,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UserGuard } from '../guards/user.guard';

@ApiTags('Follow')
@ApiBearerAuth()
@Controller()
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @ApiOperation({ summary: 'Follow a user' })
  @ApiResponse({ status: 201, description: 'User followed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @UseGuards(UserGuard)
  @Post('follow/create')
  async create(@Body() dto: CreateFollowDto, @Req() req) {
    const followerId = req.user.id;
    return this.followService.create(dto, followerId);
  }

  @ApiOperation({ summary: 'Get all follow records (all statuses)' })
  @ApiResponse({ status: 200, description: 'List of all follow records' })
  @Get('follow/all')
  @UseGuards(UserGuard)
  async findAll() {
    return this.followService.findAll();
  }

  @ApiOperation({ summary: 'Check follow status' })
  @ApiResponse({ status: 200, description: 'Returns follow status' })
  @UseGuards(UserGuard)
  @Get('follow/status/:following_id')
  async checkStatus(@Param('following_id') followingId: string, @Req() req) {
    const followerId = req.user.id;
    return this.followService.checkFollowStatus(followerId, +followingId);
  }

  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiResponse({ status: 200, description: 'User unfollowed successfully' })
  @ApiResponse({ status: 404, description: 'Follow record not found' })
  @UseGuards(UserGuard)
  @Delete('unfollow/:following_id')
  async delete(@Param('following_id') followingId: string, @Req() req) {
    const followerId = req.user.id;
    return this.followService.delete(followerId, +followingId);
  }

  @ApiOperation({ summary: 'Remove a follower' })
  @ApiResponse({ status: 200, description: 'Follower removed successfully' })
  @UseGuards(UserGuard)
  @Delete('remove-follower/:follower_id')
  async removeFollower(@Param('follower_id') followerId: string, @Req() req) {
    const targetUserId = req.user.id;
    return this.followService.removeFollower(targetUserId, +followerId);
  }

  @ApiOperation({ summary: 'Get pending follow requests for the current user' })
  @ApiResponse({ status: 200, description: 'List of pending follow requests' })
  @UseGuards(UserGuard)
  @Get('follow/requests')
  async getPendingRequests(@Req() req) {
    const targetUserId = req.user.id;
    return this.followService.findPendingRequests(targetUserId);
  }

  @ApiOperation({ summary: 'Accept a follow request' })
  @ApiResponse({ status: 200, description: 'Follow request accepted.' })
  @UseGuards(UserGuard)
  @Post('follow/accept/:follower_id')
  async acceptFollow(@Param('follower_id') followerId: string, @Req() req) {
    const targetId = req.user.id;
    return this.followService.updateFollowStatus(+followerId, targetId, true);
  }

  @ApiOperation({ summary: 'Reject a follow request' })
  @ApiResponse({ status: 200, description: 'Follow request rejected.' })
  @UseGuards(UserGuard)
  @Post('follow/reject/:follower_id')
  async rejectFollow(@Param('follower_id') followerId: string, @Req() req) {
    const targetId = req.user.id;
    return this.followService.updateFollowStatus(+followerId, targetId, false);
  }

  @ApiOperation({ summary: "Get a user's followers" })
  @ApiResponse({ status: 200, description: 'List of followers' })
  @UseGuards(UserGuard)
  @Get('follow/followers/:userId')
  async getFollowers(@Param('userId') userId: string, @Req() req) {
    const requesterId = req.user.id;
    return this.followService.getFollowers(+userId, requesterId);
  }

  @ApiOperation({ summary: "Get a user's following list" })
  @ApiResponse({ status: 200, description: 'List of following users' })
  @UseGuards(UserGuard)
  @Get('follow/following/:userId')
  async getFollowing(@Param('userId') userId: string, @Req() req) {
    const requesterId = req.user.id;
    return this.followService.getFollowing(+userId, requesterId);
  }
}
