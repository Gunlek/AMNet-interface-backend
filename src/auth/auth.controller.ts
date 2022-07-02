import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthBody } from 'src/models/auth.model';
import { AuthService } from './auth.service';
import { Response } from 'express';

export type UserType = {
  name: string;
  password: string;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post()
  @ApiOperation({
    summary: 'Allow user authentication using plain password auth',
  })
  @ApiResponse({ status: 201, description: 'Ok' })
  @ApiResponse({ status: 401, description: 'Authentication failed' })
  @ApiConsumes('application/json')
  @ApiBody({ type: AuthBody })
  // @UseGuards(JwtAuthGuard)
  async auth(@Res({ passthrough: true }) res: Response, @Body() user: UserType) {
    const token = await this.authService.login(user)

    if(token){
      res.status(HttpStatus.CREATED);
      return token
    }
    else {
      res.status(HttpStatus.UNAUTHORIZED);
      return null
    }
  }
}
