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
import ApiFeatures from '../../../utils/ApiFeatures.js';
//========================Start create Product =========================================================

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
    const filePath = `Ecommerce/categories/${existCategory.customId}/subCategories/${existSubCategory.customId}/products/${customId}`;
    console.log(customId)
    if (!req.files || !req.files.image || req.files.image.length === 0) {
        return next(new AppError('Image is required', 400));
    }
    const image = []
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.image[0].path, {
        folder: `${filePath}/image`,
        // use_filename: false,
        // unique_filename: false,
    });
    if (req.files?.image[0]) {
        image.push({ secure_url, public_id })
    }

    const coverImages = [];
    if (req.files.coverImages) {
        for (const img of req.files.coverImages) {
            const result = await cloudinary.uploader.upload(img.path, {
                folder: `${filePath}/coverImages`,
                // use_filename: false,
                // unique_filename: false,
            });
            coverImages.push({ secure_url: result.secure_url, public_id: result.public_id });
        }
    }

    //pass the filepath  the middleware to handle cloudinary error
    req.filePath = filePath

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
        discount,
        customId,
        slug: slugify(title, {
            replacement: '_',
            lower: true
        }),
        image,
        coverImages
    });

    await product.save();


    //pass the data objecto the middleware to handle database error
    req.data = { model: productModel, id: product._id }







    res.status(201).json({ msg: 'Product Created successfully', product });
});

//========================End create Product =========================================================


//==========================Start Update Product=========================================================================
export const updateProduct = asyncHandling(async (req, res, next) => {
    const { title, description, price, stock, discount, categoryId, subCategoryId, brandId } = req.body;
    const { id } = req.params;

    // Check if the category exists
    const category = await categoryModel.findById(categoryId);
    if (!category) return next(new AppError(`Category does not exist`, 404));

    // Check if the subcategory exists
    const subCategory = await subCategoryModel.findOne({ _id: subCategoryId, category: categoryId });
    if (!subCategory) return next(new AppError(`SubCategory does not exist`, 404));


    // Check if the subcategory exists
    const brand = await brandModel.findOne({ _id: brandId });
    if (!brand) return next(new AppError(`Brand does not exist`, 404));



    // Check if the product exists and belongs to the user
    const product = await productModel.findOne({ _id: id, createdBy: req.user._id });
    if (!product) return next(new AppError(`Product does not exist`, 404));

    //title
    if (title) {
        if (title.toLowerCase() == product.id)
            return next(new AppError(`Title match the Old Title`, 409));
        if (await productModel.findOneAndDelete({ title: title.toLowerCase() }))
            return next(new AppError(`Title is already exist`, 409));
        product.title = title.toLowerCase();
        product.slug = slugify(title, { replacement: '_', lower: true });


    }
    if (description) product.description = description;
    if (stock) product.stock = stock;

    // Calculate subPrice
    let subPrice = product.subPrice
    if (price && discount) {
        subPrice = price - (price * (discount / 100));
        product.price = price;
        product.discount = discount;
    }
    else if (price) {
        subPrice = price - (price * ((product.discount || 0) / 100));
        product.price = price;
    } else if (discount) {
        subPrice = product.price - (product.price * (discount / 100));
        product.discount = discount;

    }
    product.subPrice = subPrice;

    const filePath = `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}`;

    // Handle image upload
    const image = [];
    if (req.files && req.files.image && req.files.image[0]) {
        await cloudinary.uploader.destroy(product.image[0].public_id)
    }
    const { secure_url, public_id } =
        await cloudinary.uploader.upload(req.files.image[0].path, {
            folder: `${filePath}/image`,
            use_filename: false,
            unique_filename: false,
        });
    image.push({ secure_url, public_id });
    product.image = image

    // Handle coverImages upload
    if (req.files && req.files.coverImages) {
        if (product.coverImages && product.coverImages.length) {
            for (const img of product.coverImages) {
                if (img.public_id) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            }
        }
        const coverImages = [];
        for (const img of req.files.coverImages) {
            const result = await cloudinary.uploader.upload(img.path, {
                folder: `${filePath}/coverImages`,
                use_filename: false,
                unique_filename: false,
            });
            coverImages.push({ secure_url: result.secure_url, public_id: result.public_id });
        }
        product.coverImages = coverImages;
    }



    // pass the filepath  the middleware to handle cloudinary error
    req.filePath = filePath
    // Update product fields
    await product.save();
    //pass the data objecto the middleware to handle database error
    req.data = { model: productModel, id: product._id }


    res.status(200).json({ msg: 'Product updated successfully', product: product });
});



//=================DELETE==================================================

export const deleteProduct = asyncHandling(async (req, res, next) => {
    const { id } = req.params

    // Check if the product already exists
    const product = await productModel.findOneAndDelete({ _id: id, createdBy: req.user._id });
    // Check if the category exists
    const category = await categoryModel.findById(product.category);
    if (!category) return next(new AppError(`Category does not exist`, 404));

    // Check if the subcategory exists
    const subCategory = await subCategoryModel.findOne({ _id: product.subCategory });
    if (!subCategory) return next(new AppError(`SubCategory does not exist`, 404));

    const filePath = `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/products/${product.customId}`;

    await cloudinary.api.delete_resources_by_prefix(filePath);
    await cloudinary.api.delete_folder(filePath);
    if (!product) return next(new AppError(`Product not exists`, 404));



    res.status(201).json({ msg: 'Product deleted successfully', product });
});


export const getProducts = asyncHandling(async (req, res, next) => {

    // if (!products.length) return next(new AppError(`No Products match your query`, 404));

    const apiFeatures = new ApiFeatures(productModel.find(), req.query).pagination().search().sort().search()
    const products = await apiFeatures.mongooseQuery
    
    res.status(200).json({ msg: 'Done', products });
});