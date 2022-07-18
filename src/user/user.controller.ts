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
import { Response } from 'express';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('quantity')
  async getNumberOf(@Res({ passthrough: true }) res: Response): Promise<number[]> {
    res.status(HttpStatus.OK);
    return await this.userService.getNumberOfUsers();
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
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    res.status(await this.userService.updateUser(user, id));
  }

  @ApiOperation({
    summary: 'Create a user matching the provided informations',
  })
  @ApiResponse({ status: 200, description: 'A User is created' })
  @ApiResponse({ status: 206, description: 'No user is created because of a lack of information' })
  @ApiResponse({ status: 409, description: 'No user is created because of email and/or name already used' })
  @ApiConsumes('application/json')
  @ApiBody({ type: UserType })
  @Post()
  async add(@Body() user: User, @Res({ passthrough: true }) res: Response): Promise<any> {
    const { httpStatus, error } = await this.userService.createUser(user);
    res.status(httpStatus)
    return error;
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Promote the user matching the provided user id to admin rank',
  })
  @ApiResponse({ status: 200, description: 'User promoted' })
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put('promote/:id')
  async promote(@Param('id') id: number, @Res({ passthrough: true }) res: Response): Promise<void> {
    res.status(await this.userService.promoteUser(id));
  }

  @ApiOperation({
    summary: 'Demote the user matching the provided user id to user rank',
  })
  @ApiResponse({ status: 200, description: 'User demoted' })
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put('demote/:id')
  async demote(@Param('id') id: number, @Res({ passthrough: true }) res: Response): Promise<void> {
    res.status(await this.userService.demoteUser(id));
  }

  @ApiOperation({
    summary: 'Delete the user matching the specified user id',
  })
  @ApiResponse({ status: 200, description: 'User deleted' })
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  async delete(@Param('id') id: number, @Res({ passthrough: true }) res: Response): Promise<void> {
    res.status(await this.userService.deleteUser(id));
  }

  @Get('pay/:id')
  pay(): string {
    return 'start payment for a user';
  }

  @ApiResponse({ status: 200, description: 'User disabled' })
  @ApiResponse({ status: 404, description: 'No user exist with this id' })
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('unpay/:id')
  async unpay(@Param('id') id: number, @Res({ passthrough: true }) res: Response): Promise<void> {
    res.status(await this.userService.unpayUser(id));
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

  @ApiOperation({ summary: 'Get a single user from the specified user id' })
  @ApiResponse({ status: 200, description: 'A User is returned' })
  @ApiResponse({ status: 204, description: 'No user matching this id were found' })
  @ApiProduces('application/json')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @CurrentUserOnly('user')
  @Get(':id')
  async get(@Param('id') id: number, @Res({ passthrough: true }) res: Response): Promise<User> {
    const user = await this.userService.getUser(id);

    if (user) {
      res.status(HttpStatus.OK);
      return user;
    }
    else res.status(HttpStatus.NO_CONTENT);
  }

  @ApiOperation({
    summary: 'Return pseudo linked to the token',
  })
  @ApiResponse({ status: 200, description: 'The pseudo linked to the token' })
  @ApiResponse({ status: 204, description: 'The token doesnt exist' })
  @ApiConsumes('application/json')
  @Get('password/:token')
  async getPseudo(
    @Res({ passthrough: true }) res: Response,
    @Param('token') token: string,
  ): Promise<string> {
    const name = this.userService.getNameByToken(token)

    if (name) {
      res.status(HttpStatus.OK)
      return name
    }
    else res.status(HttpStatus.NO_CONTENT)
  }

  @ApiOperation({
    summary: 'Update user password by token',
  })
  @ApiResponse({ status: 200, description: 'The password is upated' })
  @ApiResponse({ status: 204, description: 'The token doesnt exist' })
  @ApiResponse({ status: 409, description: 'The 2 passwords are not identical' })
  @ApiConsumes('application/json')
  @Put('password/:token')
  async reset_paswword(
    @Res({ passthrough: true }) res: Response,
    @Body() user: { password1: string; password2: string },
    @Param('token') token: string,
  ): Promise<void> {
    res.status(await this.userService.updatePasswordByToken(token, user))
  }
}
