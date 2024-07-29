import cloudinary from "../services/cloudinary.js";

export const deleteFromCloudinary = async (req, res, next) => {
    if (req?.filePath) {
        try {
            await cloudinary.api.delete_resources_by_prefix(req.filePath);
            await cloudinary.api.delete_folder(req.filePath);
        } catch (error) {
            // Handle the error, but continue to the next middleware
            console.error('Failed to delete from Cloudinary:', error);
        }
    }
    next();
};
