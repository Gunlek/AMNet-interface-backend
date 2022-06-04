import {
  Body,
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
import { Database, RadiusDatabase } from 'src/utils/database';
const nthash = require('smbhash').nthash;
const bcrypt = require('bcrypt');

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
  @ApiResponse({ status: 200, description: 'A User is created' })
  @ApiResponse({ status: 206, description: 'No user is created because of a lack of information' })
  @ApiResponse({
    status: 409,
    description: 'No user is created because of email and/or name already used',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: UserType })
  @Post('add')
  async add(
    @Res({ passthrough: true }) res: Response,
    @Body() user: User
  ): Promise<any> {
    if (user.user_name !== "" && user.user_email !== "" && user.user_password !== "" && user.user_phone !== "") {
      const name = (await Database.promisedQuery(
        'SELECT user_id FROM users WHERE user_name=?', [user.user_name]
      )) as { user_name: string }[];

      const email = (await Database.promisedQuery(
        'SELECT user_id FROM users WHERE user_email=?', [user.user_email]
      )) as { user_email: string }[];

      if (name.length == 0 && email.length == 0) {
        const saltRounds = 10;

        bcrypt.hash(user.user_password, saltRounds, function (err: any, hash_password: string) {
          Database.promisedQuery(
            'INSERT INTO `users`(`user_name`, `user_firstname`, `user_lastname`, `user_email`, `user_phone`, `user_password`, `user_bucque`, `user_fams`, `user_campus`, `user_proms`, `user_rank`, `user_is_gadz`, `user_pay_status`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
            [user.user_name, user.user_firstname, user.user_lastname, user.user_email, user.user_phone, hash_password, user.user_bucque, user.user_fams, user.user_campus, user.user_proms, "user", user.user_is_gadz, 0]
          );

          RadiusDatabase.promisedQuery(
            'INSERT INTO `userinfo`(`username`, `firstname`, `lastname`, `email`, `creationby`, `creationdate`) VALUES (?,?,?,?,?,?)',
            [user.user_name, user.user_firstname, user.user_lastname, user.user_email, "API REST AMNet", "NOW()"]
          );

          RadiusDatabase.promisedQuery(
            'INSERT INTO `radusergroup`(`username`, `groupname`, `priority`) VALUES (?, ?, ?)',
            [user.user_name, "daloRADIUS-Disabled-Users", 0]
          );

          RadiusDatabase.promisedQuery(
            'INSERT INTO `radcheck`( `username`, `attribute`, `op`, `value`) VALUES (?, ?, ?, ?)',
            [user.user_name, "NT-Password", ":=", nthash(user.user_password)]
          );

          if (err) return err
          return "User is created"
        });
      }
      else {
        res.status(HttpStatus.CONFLICT)
        return { user_name: (name.length == 0), user_email: (email.length == 0) }
      }
    }
    else {
      res.status(HttpStatus.PARTIAL_CONTENT)
      return { user_name: user.user_name === "", user_email: user.user_email === "", user_password: user.user_password === "", user_phone: user.user_phone === "" }
    }
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
