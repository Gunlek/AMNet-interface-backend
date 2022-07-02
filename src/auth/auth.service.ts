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
      'SELECT user_id, user_password, user_rank, user_is_gadz, user_pay_status FROM users WHERE user_name=?',
      [user.name],
    ) as { user_id: string, user_password: string, user_rank: string, user_is_gadz: number, user_pay_status: number }[];

    if (results.length === 1) {
      const vadlidPassword = await bcrypt.compare(user.password, results[0]['user_password'])

      if (vadlidPassword) {
        const payload = {
          username: user.name,
          id: results[0]['user_id'],
          is_gadz: results[0]['user_is_gadz'] == 1,
          rank: results[0]['user_rank'],
          pay_status: results[0]['user_pay_status'] == 1,
        };

        return {
          access_token: this.jwtService.sign(payload),
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
