import { Controller, Delete, Get, Param, Post, Put, Res } from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Database } from 'src/utils/database';
import { Response } from 'express';
import { Access } from 'src/models/access.model';

@ApiTags('hardware')
@Controller('hardware')
export class HardwareController {
  @Get('quantity')
  async GetQuantity(
    @Res({ passthrough: true }) res: Response,
  ): Promise<number> {
    return (await Database.promisedQuery('SELECT `material_id` FROM `materials` WHERE `material_state`="pending"') as { material_id: number }[]).length;
  }

  @ApiOperation({
    summary: 'Get the full list of registered access in database from an user',
  })
  @ApiResponse({ status: 200, description: 'List of access' })
  @ApiProduces('application/json')
  @Get('user/:id')
  async userList(@Param('id') id: number,): Promise<any> {
    return (await Database.promisedQuery('SELECT * FROM `materials` WHERE material_user=?', [id]));
  }
  
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
