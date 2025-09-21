import { HttpStatus, Injectable } from '@nestjs/common';
import { Access } from 'src/models/access.model';
import { createAccess } from './functions/createAccess';
import { deleteAccess } from './functions/deleteAccess';
import { disableAccess } from './functions/disableAccess';
import { enableAccess } from './functions/enableAccess';
import { getAccess } from './functions/getAccess';
import { getNumberOfAccess } from './functions/getNumberOfAccess';
import { listAccessOfUser } from './functions/listAccesOfUser';
import { listAccess } from './functions/listAccess';
import { updateMac } from './functions/updateMac';

@Injectable()
export class AccessService {
    enableAccess(id: number): Promise<HttpStatus> {
        return enableAccess(id);
    }

    createAccess(
        access:
            {
                access_description: string,
                access_mac: string,
                access_user: number|string
            },
        acess_proof: Express.Multer.File,
        userId: number
    ): Promise<HttpStatus> {
        return createAccess(access, acess_proof, userId);
    }

    deleteAccess(id: number, userId: number): Promise<HttpStatus> {
        return deleteAccess(id, userId)
    }

    disableAccess(id: number, reason: string): Promise<HttpStatus> {
        return disableAccess(id, reason)
    }

    updateMac(id: number, new_mac: string): Promise<HttpStatus>{
        return updateMac(id, new_mac)
    }

    getNumberOfAccess() : Promise<number>{
        return getNumberOfAccess();
    }

    listAccessOfUser(id: number): Promise<Access[]>{
        return listAccessOfUser(id);
    }

    listAccess(): Promise<Access[]>{
        return listAccess();
    }

    getAccess(id: number): Promise<Access>{
        return getAccess(id);
    }
}
