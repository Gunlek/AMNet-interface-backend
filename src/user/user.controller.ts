import { Controller, Delete, Get, Post, Put } from '@nestjs/common';

@Controller('user')
export class UserController {
  @Put(':id')
  update(): string {
    return 'update a user by id';
  }

  @Post('add')
  add(): string {
    return 'create a new user';
  }

  @Post('auth')
  auth(): string {
    return 'authenticate a user';
  }

  @Put('promote/:id')
  promote(): string {
    return 'promote a user';
  }

  @Put('demote/:id')
  demote(): string {
    return 'demote a user';
  }

  @Delete(':id')
  delete(): string {
    return 'delete a user';
  }

  @Get('pay/:id')
  pay(): string {
    return 'start payment for a user';
  }

  @Get()
  list(): string {
    return 'get the list of the users';
  }

  @Get(':id')
  get(): string {
    return 'get a specific user by id';
  }
}
