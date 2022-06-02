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
  @Get('adminlist')
  async list(): Promise<any[]> {
    const List = (await Database.promisedQuery(
      'SELECT setting_value FROM settings WHERE setting_name="admin_pseudos" ||  setting_name="admin_nums"'
    ));
      
    const pseudos = List[0].setting_value.split(';');
    const nums = List[1].setting_value.split(';');
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
  ): Promise<any> {
    const value = (await Database.promisedQuery(
      'SELECT setting_value FROM settings WHERE setting_name=?',
      [name],
    )) as {setting_value: string}[];

    if (value.length == 0) res.status(HttpStatus.NO_CONTENT);
    return value[0].setting_value;
  }

  @Put(':id')
  update(): string {
    return 'update a setting by id';
  }

  
}
