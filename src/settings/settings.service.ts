import { HttpStatus, Injectable } from '@nestjs/common';
import { getAdminList } from './functions/getAdminList';
import { getSetting } from './functions/getSetting';
import { updateAdminList } from './functions/updateAdminList';
import { updateSetting } from './functions/updateSetting';

@Injectable()
export class SettingsService {
    getAdminList(): Promise<{ pseudo: string, id: string }[]> {
        return getAdminList();
    }

    updateAdminList(
        team: {
            pseudo: string,
            id: string
        }[],
        team_picture: Express.Multer.File
    ): Promise<HttpStatus> {
        return updateAdminList(team, team_picture);
    }

    getSetting(name: string): Promise<string> {
        return getSetting(name);
    }

    updateSetting(name: string, value: string): Promise<HttpStatus> {
        return updateSetting(name, value);
    }
}
