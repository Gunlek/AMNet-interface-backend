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