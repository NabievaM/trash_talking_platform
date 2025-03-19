import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SignUpUserDto } from './dto/signup-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilesService } from '../files/files.service';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './models/user.model';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { Response } from 'express';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User) private readonly userRepo: typeof User,
    private readonly jwtService: JwtService,
    private readonly fileService: FilesService,
  ) {}

  async getTokens(user: User) {
    const jwtPayload = {
      id: user.id,
      is_active: user.is_active,
      is_admin: user.is_admin,
      is_superAdmin: user.is_superAdmin,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.ACCESS_TOKEN_KEY,
        expiresIn: process.env.ACCESS_TOKEN_TIME,
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: process.env.REFRESH_TOKEN_KEY,
        expiresIn: process.env.REFRESH_TOKEN_TIME,
      }),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async registration(
    createUserDto: SignUpUserDto,
    profile_picture: any,
    res: Response,
  ) {
    const user = await this.userRepo.findOne({
      where: { email: createUserDto.email },
    });
    if (user) {
      throw new BadRequestException('Email already exists!');
    }

    let profile_picture_url: string | null = null;
    if (profile_picture) {
      profile_picture_url = await this.fileService.createFile(profile_picture);
    }

    const hashed_password = await bcrypt.hash(createUserDto.password, 7);
    const newUser = await this.userRepo.create({
      ...createUserDto,
      password: hashed_password,
      profile_picture: profile_picture_url,
    });

    const token = await this.getTokens(newUser);
    const hashed_refresh_token = await bcrypt.hash(token.refresh_token, 7);

    await this.userRepo.update(
      {
        hashed_refresh_token: hashed_refresh_token,
      },
      { where: { id: newUser.id } },
    );

    res.cookie('refresh_token', token.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return {
      message: 'User registered',
      user: newUser,
      token,
    };
  }

  async login(loginuserDto: LoginUserDto, res: Response) {
    const { email, password } = loginuserDto;
    const user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('User not registered');
    }

    if (!user.is_active) {
      throw new BadRequestException('User is not active');
    }

    const isMatchPass = await bcrypt.compare(password, user.password);

    if (!isMatchPass) {
      throw new UnauthorizedException('User not registered(password)');
    }

    const tokens = await this.getTokens(user);
    const hashed_refresh_token = await bcrypt.hash(tokens.refresh_token, 7);

    const updateUser = await this.userRepo.update(
      {
        hashed_refresh_token: hashed_refresh_token,
      },
      { where: { id: user.id }, returning: true },
    );

    res.cookie('refresh_token', tokens.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    const response = {
      message: 'User logged in',
      user: updateUser[1][0],
      tokens,
    };

    return response;
  }

  async logout(refreshToken: string, res: Response) {
    const UserData = await this.jwtService.verify(refreshToken, {
      secret: process.env.REFRESH_TOKEN_KEY,
    });

    if (!UserData) {
      throw new ForbiddenException('User not found');
    }

    const updatedUser = await this.userRepo.update(
      { hashed_refresh_token: null },
      { where: { id: UserData.id }, returning: true },
    );

    res.clearCookie('refresh_token');
    const response = {
      message: 'User logged out successfully',
      user: updatedUser[1][0],
    };

    return response;
  }

  async search({ username, email }) {
    const where = {};
    if (username) where['username'] = { [Op.iLike]: `%${username}%` };
    if (email) where['email'] = { [Op.iLike]: `%${email}%` };

    const users = await User.findAll({ where });
    if (!users.length) {
      throw new BadRequestException('No users found');
    }
    return users;
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUser: User) {
    const user = await this.userRepo.findByPk(id);
    if (!user) {
      throw new BadRequestException(`User with ID ${id} does not exist.`);
    }

    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateUserDto).filter(([_, value]) => value !== undefined),
    );

    if (currentUser.is_superAdmin) {
      await user.update(filteredUpdateData);
      return user;
    }

    if (currentUser.is_admin && currentUser.id === user.id) {
      const { is_admin, is_superAdmin, is_active, ...allowedFields } =
        filteredUpdateData;

      if (
        'is_admin' in filteredUpdateData ||
        'is_superAdmin' in filteredUpdateData ||
        'is_active' in filteredUpdateData
      ) {
        throw new ForbiddenException(
          "Admins cannot modify 'is_admin', 'is_superAdmin', or 'is_active' fields in their own profile.",
        );
      }

      await user.update(allowedFields);
      return user;
    }

    if (currentUser.is_admin && !user.is_admin) {
      if ('is_active' in filteredUpdateData) {
        await user.update({ is_active: filteredUpdateData.is_active });
        return user;
      } else {
        throw new ForbiddenException(
          "Admins can only modify the 'is_active' status of regular users.",
        );
      }
    }

    if (!currentUser.is_admin && currentUser.id === user.id) {
      const { is_admin, is_superAdmin, is_active, ...allowedFields } =
        filteredUpdateData;

      if (
        'is_admin' in filteredUpdateData ||
        'is_superAdmin' in filteredUpdateData ||
        'is_active' in filteredUpdateData
      ) {
        throw new ForbiddenException(
          "Regular users cannot modify 'is_admin', 'is_superAdmin', or 'is_active' fields.",
        );
      }

      await user.update(allowedFields);
      return user;
    }

    throw new ForbiddenException(
      'You do not have permission to update this user.',
    );
  }

  async refreshToken(refreshToken: string, res: Response) {
    const decodedToken = this.jwtService.decode(refreshToken);
    if (!decodedToken || !decodedToken['id']) {
      throw new BadRequestException('Invalid token');
    }

    const user = await this.userRepo.findOne({
      where: { id: decodedToken['id'] },
    });
    if (!user || !user.hashed_refresh_token) {
      throw new BadRequestException('User not found');
    }

    const tokenMatch = await bcrypt.compare(
      refreshToken,
      user.hashed_refresh_token,
    );
    if (!tokenMatch) {
      throw new ForbiddenException('Forbidden');
    }

    const token = await this.getTokens(user);
    user.hashed_refresh_token = await bcrypt.hash(token.refresh_token, 7);
    await this.userRepo.update(
      { hashed_refresh_token: user.hashed_refresh_token },
      { where: { id: user.id } },
    );

    res.cookie('refresh_token', token.refresh_token, {
      maxAge: 15 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return {
      message: 'Refresh token successfully',
      user,
      token,
    };
  }

  async findOne(id: number) {
    const user = await this.userRepo.findByPk(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return user;
  }

  async findAll() {
    return this.userRepo.findAll();
  }

  async remove(id: number) {
    const user = await this.userRepo.findByPk(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.userRepo.destroy({ where: { id } });
  }

  async removeFile(id: number) {
    const User = await this.userRepo.findOne({ where: { id } });

    if (!User) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return this.fileService.removeFile(User.profile_picture);
  }

  async updateImage(id: number, profile_picture: any) {
    const user = await this.userRepo.findOne({
      where: { id },
    });

    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    if (user.profile_picture) {
      const removeFile = await this.removeFile(id);
      if (!removeFile) {
        throw new BadRequestException('Image could not be removed');
      }
    }

    const createFile = await this.fileService.createFile(profile_picture);
    const [affectedCount, affectedRows] = await this.userRepo.update(
      { profile_picture: createFile },
      { where: { id }, returning: true },
    );

    if (!affectedCount) {
      throw new BadRequestException('User not found or not updated');
    }

    return affectedRows[0];
  }

  async removeImage(id: number) {
    const user = await this.userRepo.findOne({ where: { id } });

    if (!user) {
      throw new HttpException('Not found', HttpStatus.NOT_FOUND);
    }

    return this.fileService.removeFile(user.profile_picture);
  }
}
