import { HttpStatus, Injectable } from '@nestjs/common';
import { Hardware } from 'src/models/hardware.model';
import { createHardware } from './functions/createHardware';
import { deleteHardware } from './functions/deleteHardware';
import { disableHardware } from './functions/disableHardware';
import { enableHardware } from './functions/enableHardware';
import { getHardware } from './functions/getHardware';
import { getNumberOfHardware } from './functions/getNumberOfHardware';
import { listHardware } from './functions/listHardware';
import { listHardwareOfUser } from './functions/listHardwareOfUser';

@Injectable()
export class HardwareService {
    enableHardware(id: number): Promise<HttpStatus> {
        return enableHardware(id);
    }

    createHardware(material: Hardware, userId: number): Promise<HttpStatus> {
        return createHardware(material, userId);
    }

    deleteHardware(id: number, userId: number): Promise<HttpStatus> {
        return deleteHardware(id, userId)
    }

    disableHardware(id: number, reason: string): Promise<HttpStatus> {
        return disableHardware(id, reason)
    }

    getNumberOfHardware(): Promise<number> {
        return getNumberOfHardware();
    }

    listHardwareOfUser(id: number): Promise<Hardware[]> {
        return listHardwareOfUser(id);
    }

    listHardware(): Promise<Hardware[]> {
        return listHardware();
    }

    getHardware(id: number): Promise<Hardware> {
        return getHardware(id);
    }
}
