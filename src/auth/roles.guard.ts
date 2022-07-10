import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { Observable } from 'rxjs';
import jwt_decode from 'jwt-decode';

enum EnumRoles {
  USER = 0,
  ADMIN = 1,
  GOD = 2,
}

const getLowestRequiredRole = (roles: string[]) => {
  let lowest: number = EnumRoles.USER;

  roles = roles.map((role) => role.toUpperCase());
  roles.map((role) => {
    if (EnumRoles[role] > lowest) lowest = EnumRoles[role];
  });

  return lowest;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    let jwtToken = context.switchToHttp().getRequest<Request>().headers.authorization;
    if (!jwtToken) return true; // If no token, return true to allow JwtToken to do its job because RolesGuard is always used with JwtGuard
    jwtToken = jwtToken.replace('Bearer ', '');

    const tokenData: {
      [key: string]: string | number;
    } = jwt_decode(jwtToken);

    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    const lowestRole = getLowestRequiredRole(roles);

    console.log(tokenData);

    return lowestRole <= EnumRoles[(tokenData.rank as string).toUpperCase()];
  }
}

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
