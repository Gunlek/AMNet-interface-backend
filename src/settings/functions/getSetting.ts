import { Database } from "src/utils/database";

export const getSetting = async (name: string): Promise<string> => {
    const value = (await Database.promisedQuery(
        'SELECT setting_value FROM settings WHERE setting_name=?',
        [name],
    )) as { setting_value: string }[];

    if (value.length === 1)
        return value[0].setting_value;

    return null
}