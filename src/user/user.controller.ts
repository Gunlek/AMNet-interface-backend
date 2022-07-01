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
import * as bcrypt from 'bcrypt';
import { Gadzflix } from 'src/utils/jellyfin';
const nthash = require('smbhash').nthash;

@ApiTags('user')
@Controller('user')
export class UserController {
  @Get('quantity')
  async GetQuantity(
    @Res({ passthrough: true }) res: Response,
  ): Promise<number> {
    return (await Database.promisedQuery('SELECT `user_id` FROM `users` WHERE 1') as { user_id: number }[]).length;
  }

  @Get('quantity/paid')
  async GetPaidQuantity(
    @Res({ passthrough: true }) res: Response,
  ): Promise<number> {
    return (await Database.promisedQuery('SELECT `user_id` FROM `users` WHERE `user_pay_status`=1') as { user_id: number }[]).length;
  }

  @ApiOperation({
    summary: 'Update an user',
  })
  @ApiResponse({ status: 200, description: 'An User is updated' })

  @ApiConsumes('application/json')
  @ApiBody({ type: UserType })
  @Put(':id')
  async update(
    @Res({ passthrough: true }) res: Response,
    @Body() user: User,
    @Param('id') id: number
  ): Promise<any> {
    const req = (await Database.promisedQuery(
      'SELECT user_name FROM users WHERE user_id=?', [id]
    )) as { user_name: string }[];

    if (req.length === 1) {
      const name = req[0].user_name

      if (user.user_password !== "") {
        const hashed_password = await bcrypt.hash(user.user_password, Number(process.env.SALT_ROUND));
        const gadzflix_id = await Database.promisedQuery('SELECT gadzflix_id FROM users WHERE user_id=?', [id])[0]['gadzflix_id'] as string;

        await Promise.all([
          Database.promisedQuery(
            'UPDATE `users` SET `user_name`=?,`user_firstname`=?,`user_lastname`=?,`user_email`=?,`user_phone`=?,`user_password`=?,`user_bucque`=?,`user_fams`=?,`user_campus`=?,`user_proms`=?,`user_is_gadz`=? WHERE `user_id`=?',
            [user.user_name, user.user_firstname, user.user_lastname, user.user_email, user.user_phone, hashed_password, user.user_bucque, user.user_fams, user.user_campus, user.user_proms, user.user_is_gadz, id]
          ),
          RadiusDatabase.promisedQuery(
            'UPDATE `userinfo` SET `username`= ?, `firstname`= ?, `lastname`= ?, `email`= ? WHERE username=?',
            [user.user_name, user.user_firstname, user.user_lastname, user.user_email, name]
          ),
          RadiusDatabase.promisedQuery(
            'UPDATE `radusergroup` SET `username`=? WHERE `username`=?',
            [user.user_name, name]
          ),
          RadiusDatabase.promisedQuery(
            'UPDATE `radcheck` SET  `username`= ?, `value`= ? WHERE  `username`= ?',
            [user.user_name, nthash(user.user_password), name]
          ),
          Gadzflix.changePassword(gadzflix_id, user.user_password)
        ])
      }
      else {
        await Promise.all([
          Database.promisedQuery(
            'UPDATE `users` SET `user_name`=?,`user_firstname`=?,`user_lastname`=?,`user_email`=?,`user_phone`=?,`user_bucque`=?,`user_fams`=?,`user_campus`=?,`user_proms`=?,`user_is_gadz`=? WHERE `user_id`=?',
            [user.user_name, user.user_firstname, user.user_lastname, user.user_email, user.user_phone, user.user_bucque, user.user_fams, user.user_campus, user.user_proms, user.user_is_gadz, id]
          ),
          RadiusDatabase.promisedQuery(
            'UPDATE `userinfo` SET `username`= ?, `firstname`= ?, `lastname`= ?, `email`= ? WHERE username=?',
            [user.user_name, user.user_firstname, user.user_lastname, user.user_email, name]
          ),
          RadiusDatabase.promisedQuery(
            'UPDATE `radusergroup` SET `username`=? WHERE `username`=?',
            [user.user_name, name]
          ),
          RadiusDatabase.promisedQuery(
            'UPDATE `radcheck` SET  `username`= ? WHERE  `username`= ?',
            [user.user_name, name]
          ),
        ])

      }

      res.status(HttpStatus.OK);
      return 'update a user by id';
    }
    else {
      res.status(HttpStatus.BAD_REQUEST);
      return 'No user found with this id';
    }
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
  @Post()
  async add(
    @Res({ passthrough: true }) res: Response,
    @Body() user: User
  ): Promise<any> {
    if (user.user_name !== "" && user.user_email !== "" && user.user_password !== "" && user.user_phone !== "") {
      const name = (await Database.promisedQuery(
        'SELECT user_id FROM users WHERE user_name=?', [user.user_name]
      )) as { user_id: string }[];

      const email = (await Database.promisedQuery(
        'SELECT user_id FROM users WHERE user_email=?', [user.user_email]
      )) as { user_id: string }[];

      if (name.length == 0 && email.length == 0) {
        const hashed_paswword = await bcrypt.hash(user.user_password, Number(process.env.SALT_ROUND));
        const gadzflix_id = await Gadzflix.createUser(user.user_name, user.user_password)

        await Promise.all([
          Database.promisedQuery(
            'INSERT INTO `users`(`user_name`, `user_firstname`, `user_lastname`, `user_email`, `user_phone`, `user_password`, `user_bucque`, `user_fams`, `user_campus`, `user_proms`, `user_is_gadz`, gadzflix_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
            [user.user_name, user.user_firstname, user.user_lastname, user.user_email, user.user_phone, hashed_paswword, user.user_bucque, user.user_fams, user.user_campus, user.user_proms, user.user_is_gadz, gadzflix_id]
          ),
          RadiusDatabase.promisedQuery(
            'INSERT INTO `userinfo`(`username`, `firstname`, `lastname`, `email`, `creationby`, `creationdate`) VALUES (?, ?, ?, ?, ?, NOW())',
            [user.user_name, user.user_firstname, user.user_lastname, user.user_email, "API REST AMNet"]
          ),
          RadiusDatabase.promisedQuery(
            'INSERT INTO `radusergroup`(`username`, `groupname`, `priority`) VALUES (?, ?, ?)',
            [user.user_name, "Disabled-Users", 0]
          ),
          RadiusDatabase.promisedQuery(
            'INSERT INTO `radcheck`( `username`, `attribute`, `op`, `value`) VALUES (?, ?, ?, ?)',
            [user.user_name, "NT-Password", ":=", nthash(user.user_password)]
          )
        ])

        res.status(HttpStatus.OK);
        return "User is created"
      }
      else {
        res.status(HttpStatus.CONFLICT)
        return { user_name: !(name.length == 0), user_email: !(email.length == 0) }
      }
    }
    else {
      res.status(HttpStatus.PARTIAL_CONTENT)
      return { user_name: user.user_name === "", user_email: user.user_email === "", user_password: user.user_password === "", user_phone: user.user_phone === "" }
    }
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Promote the user matching the provided user id to admin rank',
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
  @ApiResponse({ status: 400, description: 'No User found' })
  @Delete(':id')
  async delete(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number,
  ): Promise<void> {
    const req = await Promise.all([
      Database.promisedQuery('SELECT user_name FROM users WHERE user_id=?', [id]),
      Database.promisedQuery('SELECT gadzflix_id FROM users WHERE user_id=?', [id])
    ]) as [{ user_name: string }[], { gadzflix_id: string }[]]

    if (req) {
      const name = req[0][0].user_name;
      const gadzflix_id = req[1][0].gadzflix_id;

      Promise.all([
        Gadzflix.removeUser(gadzflix_id),
        Database.promisedQuery('DELETE FROM users WHERE user_id=?', [id]),
        Database.promisedQuery('DELETE FROM access WHERE access_user=?', [id]),
        RadiusDatabase.promisedQuery('DELETE FROM `userinfo` WHERE username=?', [name]),
        RadiusDatabase.promisedQuery('DELETE FROM `radusergroup` WHERE `username`=?', [name]),
        RadiusDatabase.promisedQuery('DELETE FROM `radcheck` WHERE  `username`= ?', [name])
      ])

      res.status(HttpStatus.OK);
    }
    else res.status(HttpStatus.BAD_REQUEST);
  }

  @Get('pay/:id')
  pay(): string {
    return 'start payment for a user';
  }

  @ApiResponse({ status: 200, description: 'User disabled' })
  @ApiResponse({ status: 404, description: 'No user exist with this id' })
  @Get('unpay/:id')
  async unpay(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number
  ): Promise<string> {
    const name = (await Database.promisedQuery(
      'SELECT user_name FROM users WHERE user_id=?', [id]
    ))[0].user_name as string;

    if (name.length !== 0) {
      const mac_address = (await Database.promisedQuery(
        'SELECT access_mac FROM access WHERE access_user=?', [id]
      )) as { acess_mac: string }[];
      const gadzflix_id = await Database.promisedQuery('SELECT gadzflix_id FROM users WHERE user_id=?', [id])[0]['gadzflix_id'] as string;

      await Gadzflix.setIsDisabled(gadzflix_id, true)
      await Database.promisedQuery('UPDATE `users` SET `user_pay_status`= 0 WHERE  user_id=?', [id])
      await RadiusDatabase.promisedQuery('UPDATE `radusergroup` SET `groupname`="Disabled-Users" WHERE `username`=?', [name])

      mac_address.forEach(async (access) => {
        await RadiusDatabase.promisedQuery('UPDATE `radusergroup` SET `groupname`="Disabled-Users" WHERE `username`=?', [access])
      })

      res.status(HttpStatus.OK);
      return 'User disabled';
    }
    else {
      res.status(HttpStatus.NOT_FOUND);
      return 'No user exist with this id';
    }
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
  async getName(
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
      'SELECT token_user FROM reset_token WHERE token_value=?', [token]
    )) as { token_user: string }[];

    if (user_id.length === 1) {
      const user_name = (await Database.promisedQuery('SELECT user_name FROM users WHERE user_id=?', [user_id[0].token_user])) as { user_name: string }[];

      return user_name[0].user_name;
    }
    else return "No users found linked to this token";
  }

  @ApiOperation({
    summary: 'Update user password by tokken',
  })
  @ApiResponse({ status: 200, description: 'The password is upated' })
  @ApiConsumes('application/json')
  @Put('password/:token')
  async reset_paswword(
    @Res({ passthrough: true }) res: Response,
    @Body() user: { password1: string, password2: string },
    @Param('token') token: string
  ): Promise<string> {
    const user_id = (await Database.promisedQuery(
      'SELECT token_user FROM reset_token WHERE token_value=?', [token]
    )) as { token_user: string }[];

    if (user_id.length === 1) {
      if (user.password1 === user.password2) {
        const hashed_paswword = await bcrypt.hash(user.password1, Number(process.env.SALT_ROUND));
        await Database.promisedQuery('UPDATE `users` SET `user_password`=? WHERE user_id=?', [hashed_paswword, user_id[0].token_user]);
        await Database.promisedQuery('DELETE FROM `reset_token` WHERE token_value=?', [token])

        return "Password is upated"
      }
      else return "The 2 passwords are not the same";
    }
    else return "No user found linked to this token";
  }
}