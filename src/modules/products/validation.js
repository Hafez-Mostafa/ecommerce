import joi from 'joi';
import { generalFields } from '../../../utils/generalFields.js';



export const createProduct = {
    body: joi.object({
        title: joi.string().min(3).required(),
        description: joi.string().required(),
        category: generalFields.id.required(),
        subCategory: generalFields.id.required(),
        brand: generalFields.id.required(),
        price: joi.number().min(1).integer().required(),
        stock: joi.number().min(1).required(),
        discount: joi.number().min(1).max(100),
    }),

    files: joi.object({
        image: joi.array().items(generalFields.file.required()).required() , 
        coverImages: joi.array().items(generalFields.file.required()).required()
    }),
    headers: generalFields.header.required()
}




export const updateProduct = {
    params: joi.object({ id: generalFields.id.required() }),
    body: joi.object({
        title: joi.string().min(3),
        description: joi.string(),
        categoryId: generalFields.id.required(),
        subCategoryId: generalFields.id.required(),
        brandId: generalFields.id,
        price: joi.number().min(1).integer(),
        stock: joi.number().min(1),
        discount: joi.number().min(1).max(100),
    }).optional(),
    files: joi.object({
        image: joi.array().items(generalFields.file).optional(),
        coverImages: joi.array().items(generalFields.file).optional()
    }),
    headers: generalFields.header.required()
};


export const deleteProduct = {
    params: joi.object({ id: generalFields.id }),
    headers: generalFields.header.required()
}




