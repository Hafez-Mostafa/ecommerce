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
        discount,
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




//==========================================================================================================================
export const updateProduct = asyncHandling(async (req, res, next) => {
    const { title, description, price, stock, discount, categoryId, subCategoryId } = req.body;
    const { id } = req.params;

    // Check if the category exists
    const category = await categoryModel.findById(categoryId);
    if (!category) return next(new AppError(`Category does not exist`, 404));

    // Check if the subcategory exists
    const subCategory = await subCategoryModel.findOne({ _id: subCategoryId, category: categoryId });
    if (!subCategory) return next(new AppError(`SubCategory does not exist`, 404));

    // Check if the product exists and belongs to the user
    const product = await productModel.findOne({ _id: id, createdBy: req.user._id });
    if (!product) return next(new AppError(`Product does not exist`, 404));

    // Calculate subPrice
    let subPrice = product.subPrice;
    if (price && !discount) {
        subPrice = price - (price * ((product.discount || 0) / 100));
    } else if (discount && !price) {
        subPrice = product.price - (product.price * (discount / 100));
    } else if (price && discount) {
        subPrice = price - (price * (discount / 100));
    }

    const folderPath = `Ecommerce/categories/${category.customId}/subCategories/${subCategory.customId}/${product.customId}`;

    // Handle image upload
    const images = [];
    if (req.files && req.files.image && req.files.image[0]) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.image[0].path, {
            folder: folderPath,
            use_filename: false,
            unique_filename: false,
        });
        images.push({ secure_url, public_id });
    }

    // Handle coverImages upload
    const coverImages = [];
    if (req.files && req.files.coverImages) {
        for (const img of req.files.coverImages) {
            const result = await cloudinary.uploader.upload(img.path, {
                folder: folderPath,
                use_filename: false,
                unique_filename: false,
            });
            coverImages.push({ secure_url: result.secure_url, public_id: result.public_id });
        }
    }

    // Update product fields
    if (title) product.title = title;
    if (description) product.description = description;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (discount) product.discount = discount;
    product.subPrice = subPrice;
    if (title) product.slug = slugify(title, { replacement: '_', lower: true });
    if (images.length > 0) product.image = images[0]; // Assuming single image
    if (coverImages.length > 0) product.coverImages = coverImages;

    await product.save();

    res.status(200).json({ msg: 'Product updated successfully', product: product });
});



export const deleteProduct = asyncHandling(async (req, res, next) => {
    const { id } = req.params

    // Check if the product already exists
    const product = await productModel.findOneAndDelete({ _id: id, createdBy: req.user._id });
    if (!product) return next(new AppError(`Product not exists`, 404));



    res.status(201).json({ msg: 'Product deleted successfully', product });
});


export const getProducts = asyncHandling(async (req, res, next) => {
    let excludeQuery = ["page", "select", "filter", "sort"]
    //pagination
    let page = req.query.page * 1 || 1;
    if (page < 1) page = 1
    let limit = 2
    let skip = (page - 1) * limit



    //filter
    let filterQuery = { ...req.query } //deep copy
    excludeQuery.forEach(el => delete filterQuery[el])
    filterQuery = JSON.parse(
        JSON.stringify(filterQuery)
            .replace(/(gt|lt|gte|lte|eq)/, (match) => `$${match}`))


    // Check if the product already exists
    const productQuery = productModel.find(filterQuery)
        .skip(skip).limit(limit);
    //sort
    if (req.query.sort) productQuery.sort(req.query.sort.replaceAll(",", " "))

    //select
    if (req.query.select) productQuery.select(req.query.select.replaceAll(",", " "))

    //search
    if (req.query.search) {
        productQuery.find({
            $or: [
                { title: { $regex: req.query.search, $options: "i" } },
                { description: { $regex: req.query.search, $options: "i" } }]
        })

    }

    const products = await productQuery
    if (!products.length) return next(new AppError(`No Products match your query`, 404));



    res.status(200).json({ msg: 'Product deleted successfully', products });
});