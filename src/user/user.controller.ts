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
import { Roles, RolesGuard } from 'src/auth/roles.guard';
import { UserService } from './user.service';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @ApiOperation({
    summary: 'Create a user matching the provided informations',
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
  @Post('add')
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
  @Get(':id')
  async get(@Param('id') id: number): Promise<User | HttpStatus> {
    return (await this.userService.getUser(id))
      ? this.userService.getUser(id)
      : HttpStatus.NO_CONTENT;
  }
}
