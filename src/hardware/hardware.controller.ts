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
  @ApiResponse({ status: 200, description: 'List of hardware request from one use' })
  @ApiProduces('application/json')
  @Get('user/:id')
  async userList(@Param('id') id: number,): Promise<any> {
    return (await Database.promisedQuery('SELECT * FROM `materials` WHERE material_user=?', [id]));
  }

  @Post('add')
  add(): string {
    return 'create an hardware request';
  }

  @ApiOperation({
    summary: 'Get the full list of registered hardware requests',
  })
  @ApiResponse({ status: 200, description: 'List of hardware requests' })
  @ApiProduces('application/json')
  @Get()
  async all(): Promise<any> {
    return (await Database.promisedQuery(
      'SELECT *, (SELECT `user_name` FROM `users` WHERE `user_id`=`material_user`) AS `user_name`, (SELECT `user_pay_status` FROM `users` WHERE `user_id`=`material_user`) AS `user_pay_status` FROM `materials`'
    ));
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
