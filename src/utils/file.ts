import * as sharp from 'sharp';
import { diskStorage } from 'multer';
import { Request } from 'express';

export async function optimizeImage(image: Express.Multer.File) {
    const filename = `photoProof-${Date.now().toString()}.webp`;

    if (image.originalname.match(/\.(jpg|jpeg|png)$/i)) {
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
        .jpeg()
        .toFile(`./public/team.jpeg`)
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
