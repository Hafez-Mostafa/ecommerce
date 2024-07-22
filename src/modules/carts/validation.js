import joi from 'joi';
import { generalFields } from '../../../utils/generalFields.js';


export const createCart = {
    body: joi.object({
        productId: generalFields.id.required(),
        quantity: joi.number().integer().required(),

    })
    ,
    headers: generalFields.header.required()
}

export const removeCart = {
    body: joi.object({ productId: generalFields.id.required() }),
    headers: generalFields.header.required()
}

export const clearCart = {
    headers: generalFields.header.required()
}