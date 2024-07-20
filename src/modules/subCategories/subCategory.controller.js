import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve('../../../config/.env') });

import subCategoryModel from '../../../db/models/subCategory.model.js';
import categoryModel from '../../../db/models/category.model.js';
import AppError from "../../../utils/AppError.js";
import { asyncHandling } from "../../../utils/errorHandling.js";
import cloudinary from '../../../services/cloudinary.js';

import { nanoid } from 'nanoid';
import slugify from 'slugify'
import { ca } from 'date-fns/locale';
//==============================signUp=================================================

export const createSubCategory = asyncHandling(async (req, res, next) => {
    const { name } = req.body;
    // Check if the category already exists
    const existCategory = await categoryModel.findById(req.params.categoryId)
    if (!existCategory) return next(new AppError(`Categoy is not exist`, 404));


    const existSubCategory = await subCategoryModel.findOne({ name: name.toLowerCase() })
    if (existSubCategory) return next(new AppError(`subCategoy of ${name} is already exist`, 409));

    const customId = nanoid(5)

    const folderPath = `Ecommerce/categories/${existCategory.customId}/subCategories/${customId}`
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: folderPath,
        use_filename: false,
        unique_filename: false,
    });

    const subCategory = await subCategoryModel.create({
        name,
        image: { secure_url, public_id },
        createdBy: req.user._id,
        customId: customId,
        slug: slugify(name, {
            replacement: '_',
            lower: true
        }),

        category: req.params.categoryId
    })

    res.status(201).json({ msg: 'Sub Category  screated uccessfully', subCategory });
});


//=================================updateCategory=======================================================
export const updateCategory = asyncHandling(async (req, res, next) => {
    const { name } = req.body;
    const { id } = req.params;

    // Check if the category already exists
    const category = await subCategoryModel.findOne({ _id: id, createdBy: req.user._id })
    if (!category) return next(new AppError(`Categoy  is not exist`, 409));

    // Check if the subCategory already exists
    const subCategory = await subCategoryModel.findOne({ _id: id, createdBy: req.user._id })
    if (!subCategory) return next(new AppError(`Categoy  is not exist`, 409));

    if (name) {
        if (name.toLowerCase() === category.name) {
            return next(new AppError('name should be differnt', 404))
        }
        if (await categoryModel.findOne({ name: name.toLowerCase() })) {
            return next(new AppError('name is already exist', 404))

        }

        subCategory.name = name.toLowerCase()
        subCategory.slug = slugify(name, {
            replacement: '_',
            lower: true
        })


    }

    const customId = nanoid(5)
    if (req.file) {
        console.log('Updating category image:', subCategory.image.public_id);
        try {
            // Ensure public_id exists before attempting to delete
            if (subCategory.image && subCategory.image.public_id) {
                await cloudinary.uploader.destroy(subCategory.image.public_id, { resource_type: 'image' });
            } else {
                console.warn('No public_id found for existing image, skipping delete');
            }

            const folderPath = `Ecommerce/categories/${category.customId}/subcategories/${customId}`;
            const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
                folder: folderPath,
                use_filename: false,
                unique_filename: true,
            });

            subCategory.image = { secure_url, public_id };
        } catch (error) {
            console.error('Error during image update:', error);
            return next(new AppError('An unexpected error occurred during image update', 500));
        }
    }

    await subCategory.save()
    res.status(201).json({ msg: 'Updated successfully', subCategory });
});




//==================================Start Delete============================================================
export const deleteSubCategory = asyncHandling(async (req, res, next) => {
    const { id } = req.params;

        // Find and delete SubCategory if it exists
        const subCategory = await subCategoryModel.findOneAndDelete({ _id: id, createdBy: req.user._id });
        if (!subCategory) {
            return next(new AppError('SubCategory does not exist', 409));
        }

        // Fetch all categories
        const categories = await categoryModel.find({});
        let subc = [];

        // Fetch subcategories for each category and await the promises
        for (const category of categories) {
            const sub = await subCategoryModel.findOne({ category: category._id });
            if (sub) {
                subc.push(sub);
            }
        }

        // Find the parent category of the deleted subcategory
        const parentCategory = categories.find(category => category._id.equals(subCategory.category));
        if (!parentCategory) {
            return next(new AppError('Parent category not found', 404));
        }

        // Ensure there are subcategories before constructing the folder path
        const folderPath = `Ecommerce/categories/${parentCategory.customId}/subCategories/${subCategory.customId}`;

        // Delete resources and folder in Cloudinary
        await cloudinary.api.delete_resources_by_prefix(folderPath);
        await cloudinary.api.delete_folder(folderPath);

        res.status(201).json({ msg: 'Deleted successfully', subCategory });
    
});

//==================================Start GetSubCategories============================================================


export const getSubCategories = asyncHandling(async(req,res,next)=>{

    const subCategories=await subCategoryModel.find({}).populate([
        { path:"category",},
        {path:'createdBy', select:'-_id -password'  }
    ])
    if(!subCategories) return next(new AppError('No SubCategories available',404))

        res.status(201).json({msg:'All SubCategories fetched',subCategories})
})
