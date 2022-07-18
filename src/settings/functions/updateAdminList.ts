import { HttpStatus } from "@nestjs/common";
import { Multer } from "multer";
import { Database } from "src/utils/database";
import { optimizeTeamPicute } from "src/utils/file";

export const updateAdminList = async (team: { pseudo: string, id: string }[], team_picture: Express.Multer.File): Promise<HttpStatus> => {
    let httpStatus: HttpStatus | PromiseLike<HttpStatus>
    
    if (team_picture && team_picture.originalname.match(/\.(jpg|jpeg|png)$/i)) {
        optimizeTeamPicute(team_picture)
        httpStatus = HttpStatus.OK
    }

    if (team) {
        let admin_pseudos = "";
        let admin_nums = "";

        team.map((admin) => {
            admin_pseudos += admin.pseudo + ";";
            admin_nums += admin.id + ";";
        });

        await Promise.all([
            Database.promisedQuery(
                'UPDATE `settings` SET `setting_value`=? WHERE `setting_name`=?',
                [admin_pseudos, 'admin_pseudos']
            ),
            Database.promisedQuery(
                'UPDATE `settings` SET `setting_value`=? WHERE `setting_name`=?',
                [admin_nums, 'admin_nums']
            )
        ])

        httpStatus = HttpStatus.OK
    }

    if(httpStatus) return httpStatus
    else return HttpStatus.NO_CONTENT
}

