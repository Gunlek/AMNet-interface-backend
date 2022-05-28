import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
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
import { Response } from 'express';
import { User, UserType } from 'src/models/user.model';
import { Database } from 'src/utils/database';

@ApiTags('user')
@Controller('user')
export class UserController {
  @Put(':id')
  update(): string {
    return 'update a user by id';
  }

  @ApiOperation({
    summary: 'Create a user matching the provided informations',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: UserType })
  @Post('add')
  add(user: User): string {
    // TODO
    return 'create a new user';
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Demote the user matching the provided user id to user rank',
  })
  @ApiResponse({ status: 200, description: 'User promoted' })
  @Put('promote/:id')
  async promote(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number,
  ): Promise<void> {
    await Database.promisedQuery(
      'UPDATE users SET user_rank="admin" WHERE user_id=?',
      [id],
    );
    res.status(HttpStatus.OK);
  }

  @ApiOperation({
    summary: 'Demote the user matching the provided user id to user rank',
  })
  @ApiResponse({ status: 200, description: 'User demoted' })
  @Put('demote/:id')
  async demote(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number,
  ): Promise<void> {
    await Database.promisedQuery(
      'UPDATE users SET user_rank="user" WHERE user_id=?',
      [id],
    );
    res.status(HttpStatus.OK);
  }

  @ApiOperation({
    summary: 'Delete the user matching the specified user id',
  })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @Delete(':id')
  async delete(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number,
  ): Promise<void> {
    await Database.promisedQuery('DELETE FROM users WHERE user_id=?', [id]);
    res.status(HttpStatus.OK);
  }

  @Get('pay/:id')
  pay(): string {
    return 'start payment for a user';
  }

  @ApiOperation({
    summary: 'Get the full list of registered users in database',
  })
  @ApiResponse({ status: 200, description: 'List of users' })
  @ApiProduces('application/json')
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
  @Get(':id')
  async get(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number,
  ): Promise<User | any> {
    const user = (await Database.promisedQuery(
      'SELECT * FROM users WHERE user_id=?',
      [id],
    )) as User[];

    if (user.length == 0) res.status(HttpStatus.NO_CONTENT);
    return user[0];
  }
}
