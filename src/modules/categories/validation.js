import joi from 'joi';
import { generalFields } from '../../../utils/generalFields.js';





export const createCategory={
    body:joi.object({name:joi.string().required()}).required(),
    file:generalFields.file.required(),
   headers:generalFields.header.required()
}



export const updateCategory={
    body:joi.object({name:joi.string()}),
    file:generalFields.file,
    params:joi.object({id:generalFields.id}),
   headers:generalFields.header.required()
}

export const deleteCategory={
    params:joi.object({id:generalFields.id}),
    file:generalFields.file,
   headers:generalFields.header.required()
}


