import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('../../../config/.env') });

import brandModel from '../../../db/models/brand.model.js';

import AppError from "../../../utils/AppError.js";
import { asyncHandling } from "../../../utils/errorHandling.js";
import { nanoid, customAlphabet } from 'nanoid';
import cloudinary from '../../../services/cloudinary.js';
import slugify from 'slugify'
//==============================signUp=================================================

export const createbrand = asyncHandling(async (req, res, next) => {
    const { name } = req.body;
    // Check if the brand already exists
    const existbrand = await brandModel.findOne({ name: name.toLowerCase() })
    if (existbrand) return next(new AppError(`Categoy of ${name} is already exist`, 409));

    const customId = nanoid(5)
    let image = []
    if (req.file) {
        const filePath = `Ecommerce/brands/${customId}`
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {

            folder: filePath,
            use_filename: false,
            unique_filename: false,
        }

        );
        image.push({ secure_url, public_id })
    } 
    const brand = await brandModel.create({
        name,
        image:image[0],
        createdBy: req.user._id,
        customId: customId,
        slug: slugify(name, {
            replacement: '_',
            lower: true
        })
    })

    res.status(201).json({ msg: 'brand created Successfully successfully', brand });
});
//==============================================================================================


//==================================Start Update============================================================
export const updatebrand = asyncHandling(async (req, res, next) => {
    const { name } = req.body;
    const { id } = req.params;

    // Check if the subbrand exists
    const brand = await brandModel.findOne({ _id: id, createdBy: req.user._id });
    if (!brand) return next(new AppError('brand does not exist', 409));

    // Check if the name is provided and is different
    if (name) {
        if (name.toLowerCase() === brand.name) {
            return next(new AppError('Name should be different', 404));
        }
        if (await brandModel.findOne({ name: name.toLowerCase() })) {
            return next(new AppError('Name already exists', 404));
        }

        brand.name = name.toLowerCase();
        brand.slug = slugify(name, {
            replacement: '_',
            lower: true
        });
    }

    if (req.file) {
        // Ensure public_id exists before attempting to delete
        if (brand.image && brand.image.public_id)
            await cloudinary.uploader.destroy(brand.image.public_id, { resource_type: 'image' });
        const filePath = `Ecommerce/brands/${brand.customId}`;
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: filePath,
            use_filename: false,
            unique_filename: true,
        });

        brand.image = { secure_url, public_id };

    }

    // Save updated brand
    await brand.save();
    res.status(201).json({ msg: 'Updated successfully', brand });
});





//==================================Start Delete============================================================
export const deleltebrand = asyncHandling(async (req, res, next) => {
    const { id } = req.params;

    //   delete brand if it is exist
    const brand = await brandModel.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!brand) return next(new AppError('brand does not exist', 409));

    // delete  brand from cloudinary
    const folderPath = `Ecommerce/brands/${brand.customId}`;
    if (folderPath) {
        await cloudinary.api.delete_resources_by_prefix(folderPath);
        await cloudinary.api.delete_folder(folderPath);
    }

    res.status(201).json({ msg: 'Deleted successfully', brand });
});

//==================================Start Get Brands ===================================================

export const getBrands = asyncHandling(async (req, res, next) => {

    const brands = await brandModel.find({})
    if (!brands) return next(new AppError('No Brands available', 404))

    res.status(201).json({ msg: 'All Brands fetched', brands })
})
console