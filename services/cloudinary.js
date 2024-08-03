import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve('config/.env') })
import { v2 as cloudinary } from 'cloudinary';

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUDS_NAME , 
        api_key: process.env.CLOUDINARY_APIS_KEY, 
        api_secret: process.env.CLOUDINARY_APIS_SECRET
    });
     export default cloudinary