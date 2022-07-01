import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Put, Res } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiOperation, ApiProduces, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Access, AccessType } from 'src/models/access.model';
import { Database, RadiusDatabase } from 'src/utils/database';
import { Response } from 'express';
import { MacAdressVerification } from 'src/utils/mac.verification';
import * as replace from 'stream-replace';
import * as fs from 'fs';
import { Transporter } from 'src/utils/mail';


@ApiTags('access')
@Controller('access')
export class AccessController {
  @Get('quantity')
  async GetQuantity(
    @Res({ passthrough: true }) res: Response,
  ): Promise<number> {
    return (await Database.promisedQuery('SELECT `access_id` FROM `access` WHERE `access_state`="pending"') as { access_id: number }[]).length;
  }

  @ApiOperation({
    summary: 'Get the full list of registered access in database',
  })
  @ApiResponse({ status: 200, description: 'List of access' })
  @ApiProduces('application/json')
  @Get()
  async list(): Promise<Access[]> {
    return (await Database.promisedQuery('SELECT *, (SELECT `user_name` FROM `users` WHERE `user_id`=`access_user`) AS `user_name`, (SELECT `user_pay_status` FROM `users` WHERE `user_id`=`access_user`) AS `user_pay_status` FROM `access`  ')) as Access[];
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
    summary: 'Update an Access from the specified acces id',
  })
  @ApiResponse({ status: 200, description: 'Mac address of this access has been updated' })
  @ApiResponse({
    status: 204,
    description: 'No Access matching this id were found',
  })
  @ApiResponse({
    status: 400,
    description: 'Mac address of this access has not been updated because it has the wrong format',
  })
  @ApiProduces('application/json')
  @Put(':id')
  async put(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number,
    @Body() new_access: { access_mac: string }
  ): Promise<void> {
    const old_access = (await Database.promisedQuery('SELECT access_mac FROM access WHERE access_id=?', [id])) as { access_mac: string }[];

    if (old_access.length !== 0) {
      const mac_adrress = MacAdressVerification(new_access.access_mac)
      if (mac_adrress !== "") {
        await Database.promisedQuery('UPDATE `access` SET `access_mac`=? WHERE 1 WHERE access_id=?', [mac_adrress, id])
        res.status(HttpStatus.OK);
      }
      else res.status(HttpStatus.BAD_REQUEST);
    }
    else {
      res.status(HttpStatus.NO_CONTENT);
    }

  }

  @ApiOperation({
    summary: 'Create an access matching the provided informations',
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
          await RadiusDatabase.promisedQuery('INSERT INTO `radusergroup`(`username`, `groupname`, `priority`) VALUES (?, ?, ?)', [mac_adrress, "Disabled-Users", 0])
          await RadiusDatabase.promisedQuery('INSERT INTO `radcheck`( `username`, `attribute`, `op`, `value`) VALUES VALUES (?, ?, ?, ?)', [mac_adrress, "Auth-Type", ":=", "Accept"])

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
  async delete(@Res({ passthrough: true }) res: Response,
    @Param('id') id: number): Promise<void> {
    await Database.promisedQuery('DELETE FROM `access` WHERE access_id=?', [id]);
    await RadiusDatabase.promisedQuery('DELETE FROM `radcheck` WHERE `username`=?', [id])
    await RadiusDatabase.promisedQuery('DELETE FROM `radusergroup` WHERE `username`=?', [id])
  }

  @ApiOperation({
    summary: 'Enable an access',
  })
  @ApiResponse({ status: 200, description: 'Acces is enabled' })
  @ApiResponse({ status: 206, description: 'No Access found with this id' })
  @Put('enable/:id')
  async enable(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number
  ): Promise<void> {
    await Database.promisedQuery('UPDATE `access` SET `access_state`="active" WHERE access_id=?', [id]);
    await RadiusDatabase.promisedQuery('UPDATE `radusergroup` SET `groupname`="Enabled-Users" WHERE `username`=?', [id])
    const access = await Database.promisedQuery('SELECT `access_description`, `access_user` FROM `access` WHERE 1 access_id=?', [id]) as { access_description: string, access_user: string }[];

    const email = await Database.promisedQuery('SELECT `user_email` FROM `access` WHERE user_id=?', [access[0].access_user])[0].user_email as string;
    const text = "Votre demande d'accès pour l'ojebt " + access[0].access_description + " a été acceptée. <br> Vous pouvez dès maintenant le connecter à AMNet WI-Fi IoT"
    const htmlstream = fs.createReadStream('./src/mail/templates/info.html').pipe(replace("<TEXT_HERE>", text)).pipe(replace('<tr><td style="text-align: center; font-size: 12px;  padding: 0 10px;" class="text">Pour vous désabonner <a style="text-decoration: none; color:#096A09;"href="https://amnet.fr/homepage/unsubscribe" target="_blank">Cliquez ici</a></td></tr>', ""))

    await Transporter.sendMail('Votre demande a été aceptée', htmlstream, [email]);
  }

  @Put('disable/:id')
  async disable(
    @Res({ passthrough: true }) res: Response,
    @Param('id') id: number
  ): Promise<void> {
    await Database.promisedQuery('UPDATE `access` SET `access_state`="declined" WHERE access_id=?', [id]);
    await RadiusDatabase.promisedQuery('UPDATE `radusergroup` SET `groupname`="Disabled-Users" WHERE `username`=?', [id])
  }


  
}
