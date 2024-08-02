import multer from 'multer';
import AppError from '../../utils/AppError.js';

export const fileTypes = {
    images: ["image/jpeg", "image/jpg", "image/png"],
    pdf: ["application/pdf"],
    videos: ["video/mp4", "video/avi", "video/mkv", "video/mov"]
};

const configureUpload = (validateType = []) => {
    const storage = multer.diskStorage({})
    const fileFilter = (req, file, cb) => {
        if (validateType.includes(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new AppError(`Invalid file type: ${file.mimetype}`, 400), false);
    };

    return multer({
        storage,
        fileFilter
    });
};

export default configureUpload;
