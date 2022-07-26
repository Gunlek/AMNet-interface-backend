import { Database } from "src/utils/database";
import { Transporter } from "src/utils/mail";
import { createMailTemplate } from "src/utils/file";

export const notifyAdmins = async (): Promise<void> => {
    const [access, material] = await Promise.all([
        Database.promisedQuery('SELECT access_id FROM access WHERE access_state="pending"'),
        Database.promisedQuery('SELECT material_id FROM materials WHERE material_state="pending"')
    ]) as [{ access_id: number }[], { material_id: number }[]];
    
    const existAccess = access.length > 0
    const existMaterial = material.length > 0
    
    if (existAccess || existMaterial) {
        const title = '<b style="text-align: center; font-size: 25px; padding: 0 15px; display: block; width: 100%;" class="title">Des demandes sont en attente</b>'
        const acces_notification = `<a target="_blank" style="text-decoration: none; color:#096A09;" href="${process.env.HOSTNAME}/admin/iot">Demandes d'accès internet: ${access.length} </a>`;
        const material_notification = `<a target="_blank" style="text-decoration: none; color:#096A09;" href="${process.env.HOSTNAME}/admin/material">Demandes de matériel: ${material.length} </a>`;
        const text = title + '<br>' + (existAccess ? acces_notification : "") + (existAccess && existMaterial ? '<br>' : "") + (existMaterial ? material_notification : "")
    
        const htmlstream = createMailTemplate(text);
    
        await Transporter.sendMail('Des demandes en attente', htmlstream, ['contact@amnet.fr']);
    }
}