import * as sharp from 'sharp';
import { diskStorage } from 'multer';
import { Request } from 'express';
import * as replace from 'stream-replace';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as DOMPurify from 'isomorphic-dompurify';

export async function optimizeImage(image: Express.Multer.File) {
    if (image.originalname.match(/\.(jpg|jpeg|png|webp|svg)$/i)) {
        const imageId = crypto.randomBytes(64).toString('hex');
        const filename = `photoProof-${imageId}.webp`;

        await sharp(image.buffer)
            .resize({ width: 800 })
            .webp()
            .toFile(`./src/access/proof/${filename}`);

        return filename;
    }
    else return ""
};

export async function optimizeTeamPicute(team_picture: Express.Multer.File) {
    sharp(team_picture.buffer)
        .resize({ width: 1000 })
        .webp()
        .toFile(`./public/team.webp`)
};

export const docMulterOptions = {
    storage: diskStorage({
        destination: './public'
        , filename: (req, _file, cb) => {
            cb(null, `./${req.params.name}.pdf`)
        }
    }),
    fileFilter: (_req: Request, file: Express.Multer.File, cb: Function) => {
        if (file.originalname.match(/\.(pdf)$/)) cb(null, true)
        else cb(null, false)
    }
}

export function createMailTemplate(html: string) {
    const htmlstream = fs.createReadStream('./src/mail/templates/info.html')
        .pipe(replace('<TEXT_HERE>', DOMPurify.sanitize(html)))
        .pipe(replace(/<HOSTNAME_HERE>/g, process.env.HOSTNAME));

    return htmlstream
};