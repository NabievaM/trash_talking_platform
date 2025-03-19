import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Query,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { SignUpUserDto } from './dto/signup-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from './models/user.model';
import { Response } from 'express';
import { LoginUserDto } from './dto/login-user.dto';
import { NUMBER } from 'sequelize';
import { CookieGetter } from '../decorators/cookieGetter.decorator';
import { UserGuard } from '../guards/user.guard';
import { UserSelfGuard } from '../guards/user-self.guard';
import { CustomGuard } from '../guards/custom.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Register User' })
  @ApiResponse({ status: 201, type: User })
  @Post('signup')
  @UseInterceptors(FileInterceptor('profile_picture'))
  registration(
    @Body() createUserDto: SignUpUserDto,
    @UploadedFile() profile_picture: any,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.registration(createUserDto, profile_picture, res);
  }

  @ApiOperation({ summary: 'Login User' })
  @ApiResponse({ status: 200, type: User })
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.login(loginUserDto, res);
  }

  @ApiOperation({ summary: 'Logout User' })
  @ApiResponse({ status: 200, type: User })
  @HttpCode(HttpStatus.OK)
  @Post('signout')
  @UseGuards(UserGuard)
  logout(
    @CookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.logout(refreshToken, res);
  }

  @ApiOperation({ summary: 'RefreshToken User' })
  @ApiResponse({ status: 200, type: User })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(
    @CookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.userService.refreshToken(refreshToken, res);
  }

  @ApiOperation({ summary: 'All User' })
  @ApiResponse({ status: 200, type: User })
  @Get('all')
  @UseGuards(UserGuard)
  findAll() {
    return this.userService.findAll();
  }

  @ApiOperation({ summary: 'Search user' })
  @Get('search')
  @UseGuards(UserGuard)
  Find(@Query('username') username: string, @Query('email') email: string) {
    return this.userService.search({ username, email });
  }

  @ApiOperation({ summary: 'find one' })
  @ApiResponse({ status: 200, type: User })
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  @UseGuards(UserGuard)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, type: User })
  @HttpCode(HttpStatus.OK)
  @Put(':id/update')
  @UseGuards(UserGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: any,
  ) {
    return this.userService.update(+id, updateUserDto, req.user);
  }

  @ApiOperation({ summary: 'Update image' })
  @ApiResponse({
    status: 201,
    description: 'update image by id',
    type: [User],
  })
  @HttpCode(HttpStatus.OK)
  @Put('file/:id')
  @UseGuards(UserGuard, UserSelfGuard)
  @UseInterceptors(FileInterceptor('profile_picture'))
  updateFile(@Param('id') id: string, @UploadedFile() profile_picture: any) {
    return this.userService.updateImage(+id, profile_picture);
  }

  @ApiOperation({ summary: 'delete' })
  @ApiResponse({ status: 200, type: NUMBER })
  @Delete(':id/remove')
  @UseGuards(UserGuard, CustomGuard)
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
