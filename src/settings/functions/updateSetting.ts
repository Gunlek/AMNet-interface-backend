import { HttpStatus } from "@nestjs/common";
import { synchroBDD } from "src/user/functions/synchro";
import { Database, RadiusDatabase } from "src/utils/database";
import { createMailTemplate } from "src/utils/file";
import { Transporter } from "src/utils/mail";

export const updateSetting = async (name: string, value: string): Promise<HttpStatus> => {
  const setting_value = await Database.promisedQuery(
    'SELECT setting_value FROM settings WHERE setting_name=?',
    [name]
  ) as { setting_value: string }[];

  if (setting_value.length === 1) {
    await Database.promisedQuery(
      'UPDATE `settings` SET `setting_value`=? WHERE `setting_name`=?',
      [value, name]
    );

    if (name === 'usins_state' && Number(value) === 0) {
      const active_proms = (await Database.promisedQuery(
        'SELECT  `setting_value` FROM `settings` WHERE `setting_name`=?',
        ['active_proms']
      ))[0].setting_value;

      await Database.promisedQuery(
        'UPDATE `users` SET `user_proms`=?, `user_is_gadz`=? WHERE `user_proms`=?',
        [Number(active_proms) + 1, 1, Number(active_proms) + 1801]
      );

      const new_promotion = await Database.promisedQuery(
        'SELECT `user_firstname`, `user_email` FROM `users` WHERE `user_notification` = 1 && `user_proms`="?"',
        [Number(active_proms) + 1]
      ) as { user_firstname: string, user_email: string }[];

      new_promotion.map((user) => {
        const text = `
          Sal&apos;ss ${user.user_firstname},<br><br>
          Maintenant que tu es bapt&apos;ssé, tu débloques
          le plein potentiel de l&apos;AMNet
          <ul>
              <li>
                  L&apos;ajout de ta bucque/fam&apos;ss dans ton
                  <b><a href="https://amnet.fr/profile"
                          style="text-decoration: none; color:#096A09;">Profil</a></b>
              </li>
              <li>L&apos;accès au Netflix made in PG</li>
          </ul>
          Pour y accéder tu dois être connecté au rézal de
          l&apos;AMNet : <a href="https://gadzflix.fr"
              target="_blank" rel="noreferrer"
              style="text-decoration: none; color:#096A09;">https://gadzflix.fr
          </a> ou clique sur le logo !
          <a href="https://gadzflix.fr" target="_blank" rel="noreferrer" style="text-align: center;">
              <img class="image_block" border="0"
                  src="<HOSTNAME_HERE>/static/images/template/gadzflix.png"
                  style="width:50%; display: block; margin: 25px auto; max-width: 90%;"
                  alt="Logo Gadzflix" 
                />
          </a>
          <div
              style="text-align: center; margin-top: 15px;">
              Ce mail est généré automatiquement
          </div>
      `;

        const htmlstream = createMailTemplate(text);
        Transporter.sendMail("🎁 Nouveautés de l'AMNet 🎁", htmlstream, [user.user_email]);
      });

      synchroBDD();
    }

    if (name === 'guest_access') {
      if (Number(value) === 1) {
        await RadiusDatabase.promisedQuery(
          'UPDATE `radusergroup` SET `groupname`=? WHERE `username`=?',
          ["", "invite"]
        );
      }
      else {
        await RadiusDatabase.promisedQuery(
          'UPDATE `radusergroup` SET `groupname`=? WHERE `username`=?',
          ["Disabled-Users", "invite"]
        );
      }
    }

    return HttpStatus.OK
  }

  return HttpStatus.BAD_REQUEST
}