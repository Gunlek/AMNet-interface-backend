import { Controller, Delete, Get, Post, Put } from '@nestjs/common';

@Controller('settings')
export class SettingsController {
  @Get()
  all(): string {
    return 'get all settings';
  }

  @Get(':id')
  get(): string {
    return 'get a specific setting by id';
  }

  @Delete(':id')
  delete(): string {
    return 'delete a specific setting';
  }

  @Post()
  add(): string {
    return 'create a setting';
  }

  @Put(':id')
  update(): string {
    return 'update a setting by id';
  }
}
