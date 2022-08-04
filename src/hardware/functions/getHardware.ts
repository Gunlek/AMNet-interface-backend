import { Hardware } from "src/models/hardware.model";
import { Database } from "src/utils/database";

export const getHardware = async (id: number): Promise<Hardware> => {
    const hardware = (await Database.promisedQuery(
        'SELECT * FROM materials WHERE material_id=?',
        [id],
    )) as Hardware[];

    if (hardware.length == 1) return hardware[0];
}