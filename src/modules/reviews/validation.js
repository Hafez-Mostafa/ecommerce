import joi from 'joi';
import { generalFields } from '../../../utils/generalFields.js';


export const createReview={
    body:joi.object({

        comment:joi.string().required(),
        rate:joi.number().integer().min(1).max(5).required()
      
    }),
    params:joi.object({productId:generalFields.id}).required()
    ,

   headers:generalFields.header.required()
}

export const deleteReview={
   
    params:joi.object({id:generalFields.id}).required()
,

   headers:generalFields.header.required()
}