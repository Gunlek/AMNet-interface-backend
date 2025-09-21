import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res, UploadedFile, UseInterceptors, Headers, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Access, AccessType } from 'src/models/access.model';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { AccessService } from './access.service';
import jwt_decode from 'jwt-decode';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard, Roles, CurrentUserOnly } from 'src/auth/roles.guard';

@ApiBearerAuth()
@ApiTags('access')
@Controller('access')
export class AccessController {
  constructor(private accessService: AccessService) { };

  @ApiOperation({ summary: 'Get the number of pending access', })
  @ApiResponse({ status: 200, description: 'Number of pending access' })
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('quantity')
  async getNumberOfAccess(
    @Res({ passthrough: true }) res: Response,
  ): Promise<number> {
    res.status(HttpStatus.OK)
    return await this.accessService.getNumberOfAccess();
  };

  @ApiOperation({ summary: 'Get the full list of registered access in database from an user' })
  @ApiResponse({ status: 200, description: 'List of access' })
  @ApiProduces('application/json')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @CurrentUserOnly('user')
  @Get('user/:id')
  async accessList(@Param('id') id: number, @Res({ passthrough: true }) res: Response): Promise<Access[]> {
    res.status(HttpStatus.OK)
    return await this.accessService.listAccessOfUser(id);
  };

  @ApiOperation({ summary: 'Get the full list of registered access in database' })
  @ApiResponse({ status: 200, description: 'List of access' })
  @ApiProduces('application/json')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get()
  async list(@Res({ passthrough: true }) res: Response): Promise<Access[]> {
    res.status(HttpStatus.OK)
    return await this.accessService.listAccess();
  };

  @ApiOperation({ summary: 'Get a single Access from the specified acces id' })
  @ApiResponse({ status: 200, description: 'An access is returned' })
  @ApiResponse({ status: 204, description: 'No Access matching this id were found' })
  @ApiProduces('application/json')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get(':id')
  async get(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number,
  ): Promise<Access> {
    const access = await this.accessService.getAccess(id);

    if (access) {
      res.status(HttpStatus.OK)
      return access
    }
    else res.status(HttpStatus.NO_CONTENT)
  };

  @ApiOperation({ summary: 'Update an Access from the specified acces id' })
  @ApiResponse({ status: 200, description: 'Mac address of this access has been updated' })
  @ApiResponse({ status: 204, description: 'No Access matching this id were found' })
  @ApiResponse({ status: 400, description: 'Mac address of this access has not been updated because it has the wrong format' })
  @ApiProduces('application/json')
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put(':id')
  async put(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number,
    @Body() new_access: { access_mac: string }
  ): Promise<void> {
    res.status(await this.accessService.updateMac(id, new_access.access_mac));
  };

  @ApiOperation({ summary: 'Create an access matching the provided informations' })
  @ApiResponse({ status: 200, description: 'An Access is created' })
  @ApiResponse({ status: 206, description: 'No Access is created because of a lack of information' })
  @ApiResponse({ status: 409, description: 'No Access is created because of MAC address already used' })
  @ApiConsumes('application/json')
  @ApiBody({ type: AccessType })
  @UseInterceptors(FileInterceptor('access_proof'))
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('user')
  @Post()
  async add(
    @Res({ passthrough: true }) res: Response,
    @Body() access: { access_description: string, access_mac: string, access_user: number|string },
    @UploadedFile() access_proof: Express.Multer.File,
    @Headers('authorization') jwtToken: string
  ): Promise<void> {
    const userId = (await jwt_decode(jwtToken.replace('Bearer ', '')))['id'];
    res.status(await this.accessService.createAccess(access, access_proof, userId));
  };

  @ApiOperation({ summary: 'Delete an access' })
  @ApiResponse({ status: 200, description: 'Acces is enabled' })
  @ApiResponse({ status: 400, description: 'No Access found with this id' })
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('user')
  @Delete(':id')
  async delete(
    @Res({ passthrough: true }) res: Response,
    @Headers('authorization') jwtToken: string,
    @Param('id') id: number
  ): Promise<void> {
    const userId = (await jwt_decode(jwtToken.replace('Bearer ', '')))['id'];
    res.status(await this.accessService.deleteAccess(id, userId))
  };

  @ApiOperation({ summary: 'Enable an access' })
  @ApiResponse({ status: 200, description: 'Acces is enabled' })
  @ApiResponse({ status: 400, description: 'No Access found with this id' })
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put('enable/:id')
  async enable(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number
  ): Promise<void> {
    res.status(await this.accessService.enableAccess(id));
  };

  @ApiOperation({ summary: 'Disable an access' })
  @ApiResponse({ status: 200, description: 'Acces is disabled' })
  @ApiResponse({ status: 400, description: 'No Access found with this id' })
  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put('disable/:id')
  async disable(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number,
    @Body() body: { reason: string }
  ): Promise<void> {
    res.status(await this.accessService.disableAccess(id, body.reason))
  };
}