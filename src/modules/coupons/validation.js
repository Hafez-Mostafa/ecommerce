import joi from 'joi';
import { generalFields } from '../../../utils/generalFields.js';


export const createCoupon={
    body:joi.object({
        code:joi.string().required(),
        amount:joi.number().integer().required(),
        fromDate:joi.date().greater(Date.now()).required(),
        toDate:joi.date().greater(joi.ref('fromDate')).required(),    
    })
    ,
   headers:generalFields.header.required()
}

export const updateCoupon={
    body:joi.object({
        code:joi.string(),
        amount:joi.number().integer(),
        fromDate:joi.date().greater(Date.now()),
        toDate:joi.date().greater(joi.ref('fromDate')),    
    }),
    params:joi.object({id:generalFields.id}),


   headers:generalFields.header.required()
}