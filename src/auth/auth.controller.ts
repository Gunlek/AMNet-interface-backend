import { Controller, Post, Req } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthBody } from 'src/models/auth.model';
import { AuthService } from './auth.service';

export type UserType = {
  name: string;
  password: string;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post()
  @ApiOperation({
    summary: 'Allow user authentication using plain password auth',
  })
  @ApiResponse({ status: 201, description: 'Ok' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  @ApiConsumes('application/json')
  @ApiBody({ type: AuthBody })
  // @UseGuards(JwtAuthGuard)
  async auth(@Req() req) {
    const user: UserType = req.body.user;
    return this.authService.login(user);
  }
}
