import { Controller, Delete, Get, Post, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('hardware')
@Controller('hardware')
export class HardwareController {
  @Post('add')
  add(): string {
    return 'create an hardware request';
  }

  @Get()
  all(): string {
    return 'get all hardware requests';
  }

  @Get(':id')
  get(): string {
    return 'get a specific hardware request';
  }

  @Delete(':id')
  delete(): string {
    return 'delete an hardware request';
  }

  @Put('enabled/:id')
  enable(): string {
    return 'enable an hardware request';
  }

  @Put('disable/:id')
  disable(): string {
    return 'disable and hardware request';
  }
}
