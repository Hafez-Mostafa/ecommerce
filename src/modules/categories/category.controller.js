import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('../../../config/.env') });

import subCategoryModel from '../../../db/models/subCategory.model.js';
import categoryModel from '../../../db/models/category.model.js';
import AppError from "../../../utils/AppError.js";
import { asyncHandling } from "../../../utils/errorHandling.js";
import { nanoid, customAlphabet } from 'nanoid';

import slugify from 'slugify'
import cloudinary from '../../../services/cloudinary.js';
//==============================signUp=================================================

export const createCategory = asyncHandling(async (req, res, next) => {
    const { name } = req.body;
    // Check if the category already exists
    const existCategory = await categoryModel.findOne({ name: name.toLowerCase() })
    if (existCategory) return next(new AppError(`Categoy of ${name} is already exist`, 409));
    const customId = nanoid(5)
    const filePath = `Ecommerce/categories/${customId}`
    const image =[]
    if(req.file){
        
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {

        folder: filePath,
        use_filename: false,
        unique_filename: false,
    });
    image.push({ secure_url, public_id })
    }
    //pass the filepath  the middleware to handle cloudinary error
    req.filePath = filePath
    const category = await categoryModel.create({
        name,
        image: image[0],
        createdBy: req.user._id,
        customId: customId,
        slug: slugify(name, {
            replacement: '_',
            lower: true
        })
    })
    req.data = { model: categoryModel, id: category._id }


    res.status(201).json({ msg: 'Category created Successfully successfully', category });
});
//==============================================================================================


//==================================Start Update============================================================
export const updateCategory = asyncHandling(async (req, res, next) => {
    const { name } = req.body;
    const { id } = req.params;

    // Check if the subcategory exists
    const category = await categoryModel.findOne({ _id: id, createdBy: req.user._id });
    if (!category) return next(new AppError('category does not exist', 409));

    // Check if the name is provided and is different
    if (name) {
        if (name.toLowerCase() === category.name) {
            return next(new AppError('Name should be different', 404));
        }
        if (await categoryModel.findOne({ name: name.toLowerCase() })) {
            return next(new AppError('Name already exists', 404));
        }

        category.name = name.toLowerCase();
        category.slug = slugify(name, {
            replacement: '_',
            lower: true
        });
    }

    if (req.file) {
        // Ensure public_id exists before attempting to delete
        if (category.image && category.image.public_id) {
            await cloudinary.uploader.destroy(category.image.public_id, { resource_type: 'image' });
        }

        const filePath = `Ecommerce/categories/${category.customId}`;
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
            folder: filePath,
            use_filename: false,
            unique_filename: true,
        });

        category.image = { secure_url, public_id };

    }
    //pass the filepath  the middleware to handle cloudinary error
    req.filePath = filePath
    // Save updated category
    await category.save();
    req.data = { model: categoryModel, id: category._id }

    res.status(201).json({ msg: 'Updated successfully', category });
});





//==================================Start Delete============================================================
export const delelteCategory = asyncHandling(async (req, res, next) => {
    const { id } = req.params;

    //   delete Category if it is exist

    const category = await categoryModel.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!category) return next(new AppError('category does not exist', 409));

    // find und  delete SubCategory if the subcategory exists
    const subCategory = await subCategoryModel.deleteMany({ category: category._id });
    if (!subCategory) return next(new AppError('subCategory does not exist', 409));

    // delete  category from cloudinary
    const folderPath = `Ecommerce/categories/${category.customId}`;
    if (folderPath) {
        await cloudinary.api.delete_resources_by_prefix(folderPath);
        await cloudinary.api.delete_folder(folderPath);
    }

    res.status(201).json({ msg: 'Deleted successfully', category });
});


//==================================Start GetCategories============================================================


export const getCategories = asyncHandling(async (req, res, next) => {

    const categories = await categoryModel.find({}).populate([{
        path: 'subCategories'
    }])
    // if (!categories) return next(new AppError('No Categories available', 404))
    // let list = [];
    // for (const category of categories) {
    //     const subCategoies = await subCategoryModel.find({ category: category._id })
    //     const newCategory = category.toObject();// convert from BSON to Object
    //     newCategory.subCategoies = subCategoies // add subcategory to categoryobject based on Categoryid stored in subcategorymodel
    //     // add all subcategories in its each category parent
    //     list.push(newCategory)

    // }

    res.status(201).json({ msg: 'All Categories fetched', categories })
})
