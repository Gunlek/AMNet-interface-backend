import { Controller, Delete, Get, Post, Put } from '@nestjs/common';

@Controller('access')
export class AccessController {
  @Get()
  list(): string {
    return 'list all access';
  }

  @Get(':id')
  get(): string {
    return "an access by it's id";
  }

  @Post()
  add(): string {
    return 'create an access';
  }

  @Delete(':id')
  delete(): string {
    return 'delete an access';
  }

  @Put('enable/:id')
  enable(): string {
    return 'enable an access';
  }

  @Put('disable/:id')
  disable(): string {
    return 'disable an access';
  }
}
