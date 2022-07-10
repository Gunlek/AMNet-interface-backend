import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Database } from 'src/utils/database';
import { UserType } from './auth.controller';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) { }

  async login(user: UserType) {
    const results = await Database.promisedQuery(
      'SELECT user_id, user_password FROM users WHERE user_name=?',
      [user.name],
    ) as { user_id: string, user_password: string }[];

    if (results.length === 1) {
      const vadlidPassword = await bcrypt.compare(user.password, results[0]['user_password'])

      if (vadlidPassword) {
        return {
          access_token: this.jwtService.sign({ id: results[0]['user_id'] })
        };
      }
      else {
        return null;
      }
    }
    else {
      return null;
    }
  }
}
