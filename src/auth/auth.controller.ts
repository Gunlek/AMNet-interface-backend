import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthBody } from 'src/user/user.model';
import { AuthService } from './auth.service';

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
  @UseGuards(AuthGuard('local'))
  async auth(@Req() req) {
    return this.authService.login(req.user);
  }
}
