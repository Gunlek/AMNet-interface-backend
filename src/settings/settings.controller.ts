import { Body, Controller, Get, HttpStatus, Param, Put, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { docMulterOptions } from 'src/utils/file';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard, Roles } from 'src/auth/roles.guard';

@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private settingsService: SettingsService) { };

  @ApiOperation({ summary: 'Get pseudos and numbers of registered admin in database' })
  @ApiResponse({ status: 200, description: 'List of admin' })
  @ApiProduces('application/json')
  @Get('admin-list')
  async list(): Promise<{ pseudo: string, id: string }[]> {
    return await this.settingsService.getAdminList();
  };

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'List of admin updated' })
  @ApiProduces('application/json')
  @UseInterceptors(FileInterceptor('team_picture'))
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put('admin-list')
  async updateList(
    @Res({ passthrough: true }) res: Response,
    @Body() body: { team: { pseudo: string, id: string }[] },
    @UploadedFile() team_picture: Express.Multer.File
  ): Promise<void> {
    let team = [] as {
      pseudo: string,
      id: string
    }[];

    Object.entries(body).forEach(entry => {
      const [key, value] = entry;
      if (key != 'team_picture') {
        const index = key.split('.')[1];
        const type = key.split('.')[2];

        const newEntry = { pseudo: team[index] ? team[index].pseudo || "" : "", id: team[index] ? team[index].id || "" : "" };
        newEntry[type] = value
        team[index] = newEntry;
      }
    });

    res.status(await this.settingsService.updateAdminList(team, team_picture));
  };

  @ApiOperation({ summary: 'Get specific setting by id' })
  @ApiResponse({ status: 200, description: 'A setting is returned' })
  @ApiResponse({ status: 404, description: 'No setting matching this id were found' })
  @ApiProduces('application/json')
  @Get(':name')
  async get(
    @Res({ passthrough: true }) res: Response,
    @Param('name') name: string,
  ): Promise<string> {
    const value = await this.settingsService.getSetting(name);

    if (value) {
      res.status(HttpStatus.OK);
      return value;
    }
    else res.status(HttpStatus.BAD_REQUEST);
  };

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Doc updated' })
  @ApiResponse({ status: 400, description: 'Doc is not pdf' })
  @ApiProduces('application/json')
  @Put('/doc/:name')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('doc', docMulterOptions))
  async updateDoc(
    @Res({ passthrough: true }) res: Response,
    @UploadedFile() doc: Express.Multer.File
  ): Promise<void> {
    if (doc && doc.originalname.match(/\.(pdf)$/)) res.status(HttpStatus.OK);
    else res.status(HttpStatus.BAD_REQUEST);
  };

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Setting updated' })
  @ApiResponse({ status: 400, description: 'No setting with this name' })
  @ApiProduces('application/json')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':name')
  async update(
    @Res({ passthrough: true }) res: Response,
    @Param('name') name: string,
    @Body() { value: value }
  ): Promise<void> {
    res.status(await this.settingsService.updateSetting(name, value))
  }
};