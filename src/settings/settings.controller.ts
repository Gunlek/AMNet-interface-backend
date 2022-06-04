import { Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Database } from 'src/utils/database';
import { Response } from 'express';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  @ApiOperation({
    summary: 'Get pseudos and numbers of registered admin in database',
  })
  @ApiResponse({ status: 200, description: 'List of admin' })
  @ApiProduces('application/json')
  @Get('admin-list')
  async list(): Promise<{ pseudo: string, id: string }[]> {
    const list = await Database.promisedQuery(
      'SELECT setting_value FROM settings WHERE setting_name="admin_pseudos" ||  setting_name="admin_nums"'
    ) as { setting_value: string }[];

    const pseudos = list[0].setting_value.split(';');
    const nums = list[1].setting_value.split(';');
    let adminList = [];

    pseudos.map((pseudo: string, index: number) => {
      adminList.push({ pseudo: pseudo, id: nums[index] })
    });

    return adminList;
  }

  @ApiOperation({
    summary: 'Get specific setting by id',
  })
  @ApiResponse({ status: 200, description: 'A setting is returned' })
  @ApiResponse({
    status: 204,
    description: 'No setting matching this id were found',
  })
  @ApiProduces('application/json')
  @Get(':name')
  async get(
    @Res({ passthrough: true }) res: Response,
    @Param('name') name: string,
  ): Promise<string> {
    const value = (await Database.promisedQuery(
      'SELECT setting_value FROM settings WHERE setting_name=?',
      [name],
    )) as { setting_value: string }[];

    if (value.length == 0) { res.status(HttpStatus.NO_CONTENT); return "" }
    return value[0].setting_value;
  }

  @Put(':id')
  update(): string {
    return 'update a setting by id';
  }
}
