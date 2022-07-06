import { extname } from "path";

export function imageFileFilter(req, file: Express.Multer.File, callback: Function) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
};

export function editFileName(req, file: Express.Multer.File, callback: Function) {
    const fileExtName = extname(file.originalname);

    callback(null, `photoProof-${Date.now().toString()}${fileExtName}`);
};