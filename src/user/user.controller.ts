import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User, UserType } from 'src/models/user.model';
import { Database } from 'src/utils/database';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUserOnly, Roles, RolesGuard } from 'src/auth/roles.guard';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get('quantity')
  async GetQuantity(
    @Res({ passthrough: true }) res: Response,
  ): Promise<number> {
    return (
      (await Database.promisedQuery(
        'SELECT `user_id` FROM `users` WHERE 1',
      )) as { user_id: number }[]
    ).length;
  }

  @Get('quantity/paid')
  async GetPaidQuantity(
    @Res({ passthrough: true }) res: Response,
  ): Promise<number> {
    return (
      (await Database.promisedQuery(
        'SELECT `user_id` FROM `users` WHERE `user_pay_status`=1',
      )) as { user_id: number }[]
    ).length;
  }

  @ApiOperation({
    summary: 'Update an user',
  })
  @ApiResponse({ status: 200, description: 'A User is updated' })
  @ApiConsumes('application/json')
  @ApiBody({ type: UserType })
  @Put(':id')
  async update(
    @Body() user: User,
    @Param('id') id: number,
  ): Promise<HttpStatus> {
    return this.userService.updateUser(user, id);
  }

  @ApiOperation({
    summary: 'Create a user matching the provided informations',
  })
  @ApiResponse({ status: 200, description: 'A User is created' })
  @ApiResponse({
    status: 206,
    description: 'No user is created because of a lack of information',
  })
  @ApiResponse({
    status: 409,
    description: 'No user is created because of email and/or name already used',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: UserType })
  @Post()
  async add(@Body() user: User): Promise<HttpStatus> {
    return this.userService.createUser(user);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Promote the user matching the provided user id to admin rank',
  })
  @ApiResponse({ status: 200, description: 'User promoted' })
  @Roles('admin')
  @Put('promote/:id')
  async promote(@Param('id') id: number): Promise<HttpStatus> {
    return this.userService.promoteUser(id);
  }

  @ApiOperation({
    summary: 'Demote the user matching the provided user id to user rank',
  })
  @ApiResponse({ status: 200, description: 'User demoted' })
  @Roles('admin')
  @Put('demote/:id')
  async demote(@Param('id') id: number): Promise<HttpStatus> {
    return this.userService.demoteUser(id);
  }

  @ApiOperation({
    summary: 'Delete the user matching the specified user id',
  })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<HttpStatus> {
    return this.userService.deleteUser(id);
  }

  @Get('pay/:id')
  pay(): string {
    return 'start payment for a user';
  }

  @ApiResponse({ status: 200, description: 'User disabled' })
  @ApiResponse({ status: 404, description: 'No user exist with this id' })
  @Roles('admin')
  @Get('unpay/:id')
  async unpay(@Param('id') id: number): Promise<HttpStatus> {
    return this.userService.unpayUser(id);
  }

  @ApiOperation({
    summary: 'Get the full list of registered users in database',
  })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiProduces('application/json')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async list(): Promise<User[]> {
    return (await Database.promisedQuery('SELECT * FROM users')) as User[];
  }

  @ApiOperation({
    summary: 'Get a single user from the specified user id',
  })
  @ApiResponse({ status: 200, description: 'A User is returned' })
  @ApiResponse({
    status: 204,
    description: 'No user matching this id were found',
  })
  @ApiProduces('application/json')
  @Roles('admin')
  @CurrentUserOnly('user')
  @Get(':id')
  async get(@Param('id') id: number): Promise<User | HttpStatus> {
    return (await this.userService.getUser(id))
      ? this.userService.getUser(id)
      : HttpStatus.NO_CONTENT;
  }

  @ApiOperation({
    summary: 'Return pseudo linked to the token',
  })
  @ApiResponse({ status: 200, description: 'A User is created' })
  @ApiConsumes('application/json')
  @Get('password/:token')
  async get(
    @Res({ passthrough: true }) res: Response,
    @Param('token') token: string,
  ): Promise<string> {
    const user_id = (await Database.promisedQuery(
      'SELECT token_user FROM reset_token WHERE token_value=?',
      [token],
    )) as { token_user: string }[];

    if (user_id.length === 1) {
      const user_name = (await Database.promisedQuery(
        'SELECT user_name FROM users WHERE user_id=?',
        [user_id[0].token_user],
      )) as { user_name: string }[];

      return user_name[0].user_name;
    } else return 'No users found linked to this token';
  }

  @ApiOperation({
    summary: 'Update user password by tokken',
  })
  @ApiResponse({ status: 200, description: 'The password is upated' })
  @ApiConsumes('application/json')
  @Put('password/:token')
  async reset_paswword(
    @Res({ passthrough: true }) res: Response,
    @Body() user: { password1: string; password2: string },
    @Param('token') token: string,
  ): Promise<string> {
    const user_id = (await Database.promisedQuery(
      'SELECT token_user FROM reset_token WHERE token_value=?',
      [token],
    )) as { token_user: string }[];

    if (user_id.length === 1) {
      if (user.password1 === user.password2) {
        const hashed_paswword = await bcrypt.hash(
          user.password1,
          Number(process.env.SALT_ROUND),
        );
        await Database.promisedQuery(
          'UPDATE `users` SET `user_password`=? WHERE user_id=?',
          [hashed_paswword, user_id[0].token_user],
        );
        await Database.promisedQuery(
          'DELETE FROM `reset_token` WHERE token_value=?',
          [token],
        );

        return 'Password is upated';
      } else return 'The 2 passwords are not the same';
    } else return 'No user found linked to this token';
  }
}
