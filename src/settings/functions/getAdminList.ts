import { Database } from "src/utils/database";

export const getAdminList = async (): Promise<{ pseudo: string, id: string }[]> => {
    const list = await Database.promisedQuery(
        'SELECT setting_value FROM settings WHERE setting_name="admin_pseudos" ||  setting_name="admin_nums"'
    ) as { setting_value: string }[];

    const pseudos = list[0].setting_value.split(';');
    const nums = list[1].setting_value.split(';');
    let adminList = [];

    pseudos.map((pseudo: string, index: number) => {
        adminList.push({ pseudo: pseudo, id: nums[index] })
    });

    return adminList;
}