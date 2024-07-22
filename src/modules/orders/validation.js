import joi from 'joi';
import { generalFields } from '../../../utils/generalFields.js';


export const createOrder = {
    body: joi.object({
        productId: generalFields.id.optional(),
        quantity: joi.number().integer().optional(),
        couponCode: joi.string().min(3).required(),
        address: joi.string().required(),
        phone: joi.string().required(),
        paymentMethod: joi.string().valid('card','cash')

    })
    ,
    headers: generalFields.header.required()
}
