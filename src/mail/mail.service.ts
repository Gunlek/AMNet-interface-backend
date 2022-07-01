import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Database } from 'src/utils/database';
import * as replace from 'stream-replace';
import * as fs from 'fs';
import { Transporter } from 'src/utils/mail';

@Injectable()
export class MailService {
    @Cron('0 20 * * *')
    async handleCron() {
        const access = (await Database.promisedQuery('SELECT access_id FROM access WHERE access_state="pending"')) as { access_id: string }[];

        const material = (await Database.promisedQuery('SELECT material_id FROM materials WHERE material_state="pending"')) as { material_id: string }[];
        const existAccess = access.length > 0
        const existMaterial = material.length > 0

        if (existAccess || existMaterial) {
            const title = '<b style="text-align: center; font-size: 25px; padding: 0 15px; display: block; width: 100%;" class="title">Des demandes sont en attente</b>'
            const acces_notification = '<a target="_blank" style="text-decoration: none; color:#096A09;" href="' + process.env.HOSTNAME + '/admin/iot">Demandes d\'accès internet: ' + access.length.toString() + '</a>';
            const material_notification = '<a target="_blank" style="text-decoration: none; color:#096A09;" href="' + process.env.HOSTNAME + '/material/iot">Demandes de matériel: ' + material.length.toString() + ' </a>';
            const text = title + '<br>' + (existAccess ? acces_notification : "") + (existAccess && existMaterial ? '<br>' : "") + (existMaterial ? material_notification : "")

            const htmlstream = fs.createReadStream('./src/mail/templates/info.html').pipe(replace("<TEXT_HERE>", text)).pipe(replace('<tr><td style="text-align: center; font-size: 12px;  padding: 0 10px;" class="text">Pour vous désabonner <a style="text-decoration: none; color:#096A09;"href="https://amnet.fr/homepage/unsubscribe" target="_blank">Cliquez ici</a></td></tr>', ""))

            await Transporter.sendMail('Des demandes en attente', htmlstream, ['contact@amnet.fr']);
        }
    }
}
