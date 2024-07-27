import joi from 'joi';
import { generalFields } from '../../../utils/generalFields.js';


export const createWishList = {
    params: joi.object({
        productId: generalFields.id.required(),

    })
    ,
    headers: generalFields.header.required()
}

export const removeWishList = {
    params: joi.object({ id: generalFields.id.required() }),
    headers: generalFields.header.required()
}

