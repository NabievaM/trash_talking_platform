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
  Request,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Posts } from './models/post.model';
import { UpdatePostDto } from './dto/update-post.dto';
import { OwnerOrAdminGuard } from '../guards/owner-or-admin.guard';
import { UserGuard } from '../guards/user.guard';
import { UserSelfGuard } from '../guards/user-self.guard';

@ApiTags('Posts')
@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @ApiOperation({ summary: 'Add Post' })
  @ApiResponse({ status: 200, description: 'New Post', type: Posts })
  @Post('create')
  @UseGuards(UserGuard)
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile() image: any,
    @Request() req,
  ) {
    return this.postService.create(createPostDto, image, req.user.id);
  }

  @ApiOperation({ summary: 'View all posts' })
  @ApiResponse({
    status: 200,
    description: 'List of posts',
    type: [Posts],
  })
  @Get('all')
  @UseGuards(UserGuard)
  async findAll(@Request() req): Promise<Posts[]> {
    const isAdmin = req.user.is_admin;
    return this.postService.findAll(req.user.id, isAdmin);
  }

  @ApiOperation({ summary: "User's own posts" })
  @ApiResponse({
    status: 200,
    description: "List of posts created by the authenticated user",
    type: [Posts],
  })
  @Get('me/posts')
  @UseGuards(UserGuard)
  async myPosts(@Request() req): Promise<Posts[]> {
    return this.postService.myPosts(req.user.id);
  }

  @ApiOperation({ summary: 'Search post' })
  @Get('search')
  @UseGuards(UserGuard)
  async find(@Query('title') title: string, @Request() req) {
    return this.postService.search({ title }, req.user.id);
  }

  @ApiOperation({ summary: 'View Post by id' })
  @ApiResponse({ status: 200, description: 'Post', type: Posts })
  @Get(':id')
  @UseGuards(UserGuard)
  async findById(@Param('id') id: string, @Request() req): Promise<Posts> {
    return this.postService.GetById(+id, req.user.id);
  }

  @ApiOperation({ summary: 'Post edit' })
  @ApiResponse({ status: 200, description: 'Updated Post', type: Posts })
  @Put(':id')
  @UseGuards(UserGuard, UserSelfGuard)
  async updateById(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.updateById(+id, updatePostDto);
  }

  @ApiOperation({ summary: 'Image update' })
  @ApiResponse({
    status: 200,
    description: 'Updated image by id',
    type: Posts,
  })
  @HttpCode(HttpStatus.OK)
  @Put('file/:id')
  @UseGuards(UserGuard, UserSelfGuard)
  @UseInterceptors(FileInterceptor('image'))
  updateFile(@Param('id') id: string, @UploadedFile() image: any) {
    return this.postService.updateImage(+id, image);
  }

  @ApiOperation({ summary: 'Delete Post' })
  @ApiResponse({
    status: 200,
    description: 'Deleted Post',
    type: Object,
  })
  @Delete(':id')
  @UseGuards(OwnerOrAdminGuard)
  @SetMetadata('model', Posts)
  async deleteById(@Param('id') id: string) {
    return this.postService.deleteById(+id);
  }
}
