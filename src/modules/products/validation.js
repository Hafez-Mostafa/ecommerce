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


// export const deleteProduct = {
//     params: joi.object({ id: generalFields.id }),
//     headers: generalFields.header.required()
// }




export const updateProduct = {
    body: joi.object({ name: joi.string() }),
    params: joi.object({
        id: generalFields.id.required()
    }),
    file: generalFields.file,
    headers: generalFields.header.required()
}


