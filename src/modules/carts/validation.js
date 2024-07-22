import joi from 'joi';
import { generalFields } from '../../../utils/generalFields.js';


export const createCart={
    body:joi.object({
        productId:generalFields.id.required(),
        quantity:joi.number().integer().required(),
          
    })
    ,
   headers:generalFields.header.required()
}

export const updateCart={
    body:joi.object({
        code:joi.string(),
        amount:joi.number().integer(),
        fromDate:joi.date().greater(Date.now()),
        toDate:joi.date().greater(joi.ref('fromDate')),    
    }),
    params:joi.object({id:generalFields.id}),


   headers:generalFields.header.required()
}