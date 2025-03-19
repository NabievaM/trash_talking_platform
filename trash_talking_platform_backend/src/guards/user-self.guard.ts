import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class UserSelfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (!req.user) {
      throw new ForbiddenException({
        message: 'The user is not authenticated or the token is invalid.',
      });
    }

    if (!req.user.id) {
      throw new ForbiddenException({
        message: 'User ID could not be determined.',
      });
    }

    if (String(req.user.id) !== req.params.id) {
      throw new ForbiddenException({
        message:
          'Access denied: You do not have permission to perform this action.',
      });
    }

    return true;
  }
}
