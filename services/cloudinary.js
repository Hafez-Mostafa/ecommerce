import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve('../../../config/.env') })

import { v2 as cloudinary } from 'cloudinary';

    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dquauuxwt', 
        api_key: process.env.CLOUDINARY_API_KEY|| 331388689484714, 
        api_secret: process.env.CLOUDINARY_API_SECRET || '2XoAxnSHQ87q32y_ApK4AdzKPS0'
    });
     export default cloudinary