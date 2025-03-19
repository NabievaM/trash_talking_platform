import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from '../user/models/user.model';

@Injectable()
export class CustomGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

    let user: Partial<User>;
    try {
      user = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('ACCESS_TOKEN_KEY'),
      });
    } catch (error) {
      throw new UnauthorizedException('Unauthorized: Invalid token');
    }

    if (!user || !user.id) {
      throw new UnauthorizedException('Unauthorized: No user found');
    }

    if (Boolean(user.is_superAdmin)) {
      return true;
    }

    if (Boolean(user.is_admin)) {
      return true;
    }

    if (String(user.id) === req.params.id) {
      return true;
    }

    throw new ForbiddenException('Access denied: You do not have permission');
  }
}
