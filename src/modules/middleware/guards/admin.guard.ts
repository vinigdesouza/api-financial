import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { userRoles } from '../jwt.middleware';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== userRoles.ADMIN) {
      throw new UnauthorizedException('Access restricted to admins only');
    }

    return true;
  }
}
