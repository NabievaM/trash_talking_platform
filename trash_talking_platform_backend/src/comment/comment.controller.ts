import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { Comment } from './models/comment.model';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { UserGuard } from '../guards/user.guard';

@ApiTags('Comment')
@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ summary: 'Add comment' })
  @ApiResponse({ status: 200, description: 'New Comment', type: Comment })
  @Post('create')
  @UseGuards(UserGuard)
  create(@Body() createCommentDto: CreateCommentDto, @Req() req) {
    return this.commentService.create(createCommentDto, req.user.id);
  }

  @ApiOperation({ summary: 'View all comments' })
  @ApiResponse({
    status: 200,
    description: 'List of comments',
    type: [Comment],
  })
  @Get('all')
  @UseGuards(UserGuard)
  findAll(@Req() req): Promise<Comment[]> {
    return this.commentService.findAll(req.user.id);
  }

  @ApiOperation({ summary: 'View Comment by id' })
  @ApiParam({ name: 'id', required: true, description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment', type: Comment })
  @Get(':id')
  @UseGuards(UserGuard)
  findById(@Param('id') id: string, @Req() req): Promise<Comment> {
    return this.commentService.findById(parseInt(id), req.user.id);
  }

  @ApiOperation({ summary: 'Edit Comment' })
  @ApiResponse({ status: 200, description: 'Updated Comment', type: Comment })
  @Put(':id')
  @UseGuards(UserGuard)
  updateById(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Req() req,
  ) {
    return this.commentService.updateById(
      parseInt(id),
      updateCommentDto,
      req.user.id,
    );
  }

  @ApiOperation({ summary: 'Delete Comment' })
  @ApiResponse({ status: 204, description: 'Deleted Comment' })
  @Delete(':id')
  @UseGuards(UserGuard)
  async deleteById(@Param('id') id: string, @Req() req): Promise<void> {
    return this.commentService.deleteById(parseInt(id), req.user.id);
  }
}
