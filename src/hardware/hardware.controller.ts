import { Controller, Delete, Get, Param, Post, Put, Headers, Res, Body, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HardwareService } from './hardware.service';
import { Hardware } from 'src/models/hardware.model';
import jwt_decode from 'jwt-decode';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard, Roles, CurrentUserOnly } from 'src/auth/roles.guard';

@ApiBearerAuth()
@ApiTags('hardware')
@Controller('hardware')
export class HardwareController {
  constructor(private hardwareService: HardwareService) {};

  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('quantity')
  async GetQuantity(
    @Res({ passthrough: true }) res: Response,
  ): Promise<number> {
    return await this.hardwareService.getNumberOfHardware();
  };

  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @CurrentUserOnly('user')
  @ApiOperation({
    summary: 'Get the full list of registered access in database from an user',
  })
  @ApiResponse({ status: 200, description: 'List of hardware request from one use' })
  @ApiProduces('application/json')
  @Get('user/:id')
  async userList(@Param('id') id: number): Promise<Hardware[]> {
    return await this.hardwareService.listHardwareOfUser(id);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('user')
  @Post()
  async add(
    @Res({ passthrough: true }) res: Response,
    @Headers('authorization') jwtToken: string,
    @Body() hardware: Hardware
  ): Promise<void> {
    const userId = (await jwt_decode(jwtToken.replace('Bearer ', '')))['id'];
    res.status(await this.hardwareService.createHardware(hardware, userId))
  };

  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Get the full list of registered hardware requests',
  })
  @ApiResponse({ status: 200, description: 'List of hardware requests' })
  @ApiProduces('application/json')
  @Get()
  async all(): Promise<Hardware[]> {
    return await this.hardwareService.listHardware();
  };

  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get(':id')
  async get(@Param('id') id: number): Promise<Hardware> {
    return await this.hardwareService.getHardware(id);
  };

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
    res.status(await this.hardwareService.deleteHardware(id, userId));
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put('enabled/:id')
  async enable(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number
  ): Promise<void> {
    res.status(await this.hardwareService.enableHardware(id));
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Put('disable/:id')
  async disable(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number
  ): Promise<void> {
    res.status(await this.hardwareService.disableHardware(id));
  }
}
