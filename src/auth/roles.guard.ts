import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import jwt_decode from 'jwt-decode';
import { Database } from 'src/utils/database';

enum EnumRoles {
  USER = 0,
  ADMIN = 1,
  GOD = 2,
}

const getLowestRequiredRole = (roles: string[]) => {
  let lowest: number = EnumRoles.GOD;

  roles = roles.map((role) => role.toUpperCase());
  roles.map((role) => {
    if (EnumRoles[role] < lowest) lowest = EnumRoles[role];
  });

  return lowest;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    let jwtToken = request.headers.authorization;
    if (!jwtToken) return true; // If no token, return true to allow JwtToken to do its job because RolesGuard is always used with JwtGuard
    jwtToken = jwtToken.replace('Bearer ', '');

    const tokenData: {
      [key: string]: string | number;
    } = jwt_decode(jwtToken);

    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    const userId = tokenData.id;
    const user_rank = (await Database.promisedQuery(
      'SELECT  `user_rank` FROM `users` WHERE `user_id`=?',
      [userId]
    ))[0].user_rank as string

    const lowestRole = getLowestRequiredRole(roles);

    const minimumRole = this.reflector.get<string[]>(
      'minRole',
      context.getHandler(),
    );
    if (minimumRole && minimumRole.length == 1) {
      const targetId = request.params.id;
      
      const currentUserCondition =
        targetId == userId &&
        EnumRoles[(user_rank as string).toUpperCase()] >=
          EnumRoles[minimumRole[0].toUpperCase()]; // User is user and trying to view its own data

      return (
        lowestRole <= EnumRoles[(user_rank as string).toUpperCase()] ||
        currentUserCondition
      );
    } else
      return lowestRole <= EnumRoles[(user_rank as string).toUpperCase()];
  }
}

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Logged in user from group >= minRole can edit or view data with the same ids as its token
export const CurrentUserOnly = (...minRole: string[]) =>
  SetMetadata('minRole', minRole);
