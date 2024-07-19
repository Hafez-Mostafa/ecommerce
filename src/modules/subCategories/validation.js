import joi from 'joi';
import { generalFields } from '../../../utils/generalFields.js';





export const createSubCategory = {
    body: joi.object({ name: joi.string().required() }).required(),
    params: joi.object({
        categoryId: generalFields.id.required()
    }),
    file: generalFields.file.required(),
    headers: generalFields.header.required()
}


export const deleteSubCategory={
    params:joi.object({id:generalFields.id}),
   headers:generalFields.header.required()
}




export const updateSubCategory = {
    body: joi.object({ name: joi.string() }),
    params: joi.object({
        id: generalFields.id.required()
    }),
    file: generalFields.file,
    headers: generalFields.header.required()
}


