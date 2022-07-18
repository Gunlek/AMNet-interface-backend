import { HttpStatus } from "@nestjs/common";
import { Database } from "src/utils/database";

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
        }
    
        return HttpStatus.OK
      }
      
      return HttpStatus.BAD_REQUEST
}





 