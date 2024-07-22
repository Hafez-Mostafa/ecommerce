import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('../../../config/.env') });

import brandModel from '../../../db/models/brand.model.js';
import subCategoryModel from '../../../db/models/subCategory.model.js';
import categoryModel from '../../../db/models/category.model.js';
import productModel from '../../../db/models/product.model.js';

import AppError from "../../../utils/AppError.js";
import { asyncHandling } from "../../../utils/errorHandling.js";
import cloudinary from '../../../services/cloudinary.js';

import { nanoid } from 'nanoid';
import slugify from 'slugify';

export const createProduct = asyncHandling(async (req, res, next) => {
    const { title, description, category, subCategory, brand, price, stock, discount } = req.body;

    // Check if the category exists
    const existCategory = await categoryModel.findById(category);
    if (!existCategory) return next(new AppError(`Category does not exist`, 404));

    // Check if the subcategory exists
    const existSubCategory = await subCategoryModel.findOne({ _id: subCategory, category });
    if (!existSubCategory) return next(new AppError(`SubCategory does not exist`, 404));

    // Check if the brand exists
    const existsBrand = await brandModel.findById(brand);
    if (!existsBrand) return next(new AppError(`Brand does not exist`, 404));

    // Check if the product already exists
    const existProduct = await productModel.findOne({ title: title.toLowerCase() });
    if (existProduct) return next(new AppError(`Product already exists`, 409));

    const subPrice = price - (price * ((discount || 0) / 100));
    const customId = nanoid(5);
    const folderPath = `Ecommerce/categories/${existCategory.customId}/subCategories/${existSubCategory.customId}/${customId}`;

    if (!req.files || !req.files.image || req.files.image.length === 0) {
        return next(new AppError('Image is required', 400));
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: folderPath,
        use_filename: false,
        unique_filename: false,
    });

    const coverImages = [];
    if (req.files.coverImages) {
        for (const img of req.files.coverImages) {
            const result = await cloudinary.uploader.upload(img.path, {
                folder: folderPath,
                use_filename: false,
                unique_filename: false,
            });
            coverImages.push({ secure_url: result.secure_url, public_id: result.public_id });
        }
    }

    const product = new productModel({
        title,
        description,
        createdBy: req.user._id,
        category,
        subCategory,
        brand,
        price,
        stock,
        subPrice,
        customId,
        slug: slugify(title, {
            replacement: '_',
            lower: true
        }),
        image: { secure_url, public_id },
        coverImages
    });

    await product.save();

    if (product == null) {
        await cloudinary.api.delete_resources_by_prefix(folderPath);
        await cloudinary.api.delete_folder(folderPath);
        console.log('cluodinary should delete')
        return next(new AppError(`Failed to add product`, 409));
    }

    res.status(201).json({ msg: 'Product Created successfully', product });
});
