import joi from 'joi';
import { generalFields } from '../../../utils/generalFields.js';


export const createOrder = {
    body: joi.object({
        productId: generalFields.id.optional(),
        quantity: joi.number().integer().optional(),
        couponCode: joi.string().min(3),
        address: joi.string().required(),
        phone: joi.string().required(),
        paymentMethod: joi.string().valid('card','cash')

    })
    ,
    headers: generalFields.header.required()
}


export const cancelOrder = {
    params: joi.object({ id: generalFields.id.required(), }),
    body: joi.object({ reason: joi.string().optional() })

    ,
    headers: generalFields.header.required()
}
