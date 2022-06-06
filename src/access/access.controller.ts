import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Access, AccessType } from 'src/models/access.model';
import { Database } from 'src/utils/database';
import { Response } from 'express';
import { MacAdressVerification } from 'src/utils/mac.verification';

@ApiTags('access')
@Controller('access')
export class AccessController {
  @ApiOperation({
    summary: 'Get the full list of registered access in database',
  })
  @ApiResponse({ status: 200, description: 'List of access' })
  @ApiProduces('application/json')
  @Get()
  async list(): Promise<Access[]> {
    return (await Database.promisedQuery('SELECT * FROM access')) as Access[];
  }

  @ApiOperation({
    summary: 'Get a single Access from the specified acces id',
  })
  @ApiResponse({ status: 200, description: 'An access is returned' })
  @ApiResponse({
    status: 204,
    description: 'No Access matching this id were found',
  })
  @ApiProduces('application/json')
  @Get(':id')
  async get(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number,
  ): Promise<Access> {
    const access = (await Database.promisedQuery(
      'SELECT * FROM access WHERE access_id=?',
      [id],
    )) as Access[];

    if (access.length == 0) res.status(HttpStatus.NO_CONTENT);
    return access[0];
  }

  @ApiOperation({
    summary: 'Create a user matching the provided informations',
  })
  @ApiResponse({ status: 200, description: 'An Access is created' })
  @ApiResponse({ status: 206, description: 'No Access is created because of a lack of information' })
  @ApiResponse({
    status: 409,
    description: 'No Access is created because of MAC address already used',
  })
  @ApiResponse({
    status: 400,
    description: 'No Access is created because because the mac address has the wrong format',
  })
  @ApiConsumes('application/json')
  @ApiBody({ type: AccessType })
  @Post()
  async add(
    @Res({ passthrough: true }) res: Response,
    @Body() access: Access
  ): Promise<string | { access_description: boolean, access_mac: boolean, access_proof: boolean, access_user: boolean }> {
    if (access.access_description && access.access_mac && access.access_proof && access.access_user) {
      const access_id = (await Database.promisedQuery(
        'SELECT access_id FROM access WHERE access_mac =?', [access.access_mac]
      )) as { access_id: string }[];

      if (access_id.length === 0) {
        const mac_adrress = MacAdressVerification(access.access_mac)

        if (mac_adrress !== "") {
          await Database.promisedQuery(
            'INSERT INTO `access`(`access_description`, `access_mac`, `access_proof`, `access_user`, `access_state`) VALUES (?, ?, ?, ?, ?)', [access.access_description, mac_adrress, access.access_proof, access.access_user, "pending"])

          return "Access is created";
        }
        else {
          res.status(HttpStatus.BAD_REQUEST)
          return "Mac address invalid"
        }
      }
      else {
        res.status(HttpStatus.CONFLICT)
        return "Mac address already used"
      }
    }
    else {
      res.status(HttpStatus.PARTIAL_CONTENT)
      return { access_description: typeof access.access_description === "undefined", access_mac: typeof access.access_mac === "undefined", access_proof: typeof access.access_proof === "undefined", access_user: typeof access.access_user === "undefined" }
    }
  }

  @Delete(':id')
  async delete(): Promise<string> {
    return 'delete an access';
  }

  @Put('enable/:id')
  async enable(): Promise<string> {
    return 'enable an access';
  }

  @Put('disable/:id')
  async disable(): Promise<string> {
    return 'disable an access';
  }
}
