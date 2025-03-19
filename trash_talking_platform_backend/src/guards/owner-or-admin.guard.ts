import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Model, ModelCtor } from 'sequelize-typescript';

@Injectable()
export class OwnerOrAdminGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Unauthorized: No token provided');
    }

    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Unauthorized: Invalid token format');
    }

    const secret = this.configService.get<string>('ACCESS_TOKEN_KEY');
    if (!secret) {
      throw new Error('ACCESS_TOKEN_KEY is not set in environment variables');
    }

    let user;
    try {
      user = await this.jwtService.verifyAsync(token, { secret });
    } catch (error) {
      throw new UnauthorizedException('Unauthorized: Invalid token');
    }

    if (!user || !user.id) {
      throw new UnauthorizedException('Unauthorized: No user found');
    }

    if (user.is_admin) {
      return true;
    }

    const id = req.params.id;
    if (!id) {
      throw new ForbiddenException('Invalid request: No ID provided');
    }

    const model =
      this.reflector.get<ModelCtor<Model>>('model', context.getHandler()) ||
      this.reflector.get<ModelCtor<Model>>('model', context.getClass());

    if (!model) {
      throw new ForbiddenException(
        'Model not found in metadata. Ensure @SetMetadata("model", YourModel) is set in controller.',
      );
    }

    const record = await model.findByPk(id);
    // console.log('Record:', record);

    if (!record || !record.get) {
      throw new ForbiddenException(
        'Record not found or invalid model instance',
      );
    }

    const ownerId = record.get('reported_by') ?? record.get('user_id');
    // console.log('Record Owner ID:', ownerId);
    // console.log('User ID from token:', user.id);

    if (Number(ownerId) !== Number(user.id)) {
      throw new ForbiddenException('Access denied: You do not have permission');
    }

    return true;
  }
}
