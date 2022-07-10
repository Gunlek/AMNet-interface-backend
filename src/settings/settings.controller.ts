import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Database } from 'src/utils/database';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessType } from 'src/models/access.model';
import { optimizeTeamPicute, docMulterOptions } from 'src/utils/file';

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

  @ApiResponse({ status: 200, description: 'List of admin updated' })
  @ApiProduces('application/json')
  @ApiBody({ type: AccessType })
  @UseInterceptors(FileInterceptor('team_picture'))
  @Put('admin-list')
  async updateList(
    @Res({ passthrough: true }) _res: Response,
    @Body() team: { pseudo: string, id: string }[],
    @UploadedFile() team_picture: Express.Multer.File
  ): Promise<void> {
    if (team_picture && team_picture.originalname.match(/\.(jpg|jpeg|png)$/i)) {
      optimizeTeamPicute(team_picture)
    }

    if (team) {
      let admin_pseudos = "";
      let admin_nums = "";

      team.map((admin) => {
        admin_pseudos += admin.pseudo + ";";
        admin_nums += admin.id + ";";
      });

      await Promise.all([
        Database.promisedQuery(
          'UPDATE `settings` SET `setting_value`=? WHERE `setting_name`',
          [admin_pseudos, 'admin_pseudos']
        ),
        Database.promisedQuery(
          'UPDATE `settings` SET `setting_value`=? WHERE `setting_name`',
          [admin_nums, 'admin_nums']
        )
      ])
    }
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

  @ApiResponse({ status: 200, description: 'Doc updated' })
  @ApiResponse({ status: 400, description: 'Doc is not pdf' })
  @ApiProduces('application/json')
  @Put('/doc/:name')
  @UseInterceptors(FileInterceptor('doc', docMulterOptions))
  async updateDoc(
    @Res({ passthrough: true }) res: Response,
    @UploadedFile() doc: Express.Multer.File
  ): Promise<void> {
    if (doc && doc.originalname.match(/\.(pdf)$/))
      res.status(HttpStatus.OK);
    else
      res.status(HttpStatus.BAD_REQUEST);
  }

  @Put(':id')
  async update(): Promise<string> {
    return 'update a setting by id';
  }
}