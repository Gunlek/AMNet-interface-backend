import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport/dist/auth.guard';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
