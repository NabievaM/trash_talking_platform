import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Like } from './models/like.model';
import { UserGuard } from '../guards/user.guard';

@ApiTags('Like')
@Controller('like')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiOperation({ summary: 'Add like' })
  @ApiResponse({ status: 201, description: 'New Like', type: Like })
  @Post('create')
  @UseGuards(UserGuard)
  create(@Body() createLikeDto: CreateLikeDto, @Req() req) {
    return this.likeService.create(createLikeDto, req.user.id);
  }

  @ApiOperation({ summary: 'View all likes' })
  @ApiResponse({ status: 200, description: 'List of likes', type: [Like] })
  @Get('all')
  @UseGuards(UserGuard)
  findAll(@Req() req): Promise<Like[]> {
    return this.likeService.findAll(req.user.id);
  }

  @ApiOperation({ summary: 'View Like by id' })
  @ApiResponse({ status: 200, description: 'Like', type: Like })
  @Get(':id')
  @UseGuards(UserGuard)
  findById(@Param('id') id: string, @Req() req): Promise<Like> {
    return this.likeService.getById(+id, req.user.id);
  }

  @ApiOperation({ summary: 'Delete Like' })
  @ApiResponse({ status: 200, description: 'Delete Like' })
  @Delete(':id')
  @UseGuards(UserGuard)
  deleteById(@Param('id') id: string, @Req() req): Promise<number> {
    return this.likeService.deleteById(+id, req.user.id);
  }
}
