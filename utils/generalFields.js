import Joi from "joi";
import mongoose from "mongoose";

export const objectValidator = (value, helper) => {
    return mongoose.Types.ObjectId.isValid(value) ? true : helper.message('invalid ID Value')

}

export const generalFields = {
    name: Joi.string().min(3).max(15),
    file: Joi.object({
        size: Joi.number().positive().required(),
        path: Joi.string().required(),
        filename: Joi.string().required(),
        destination: Joi.string().required(),
        mimetype: Joi.string().required(),
        encoding: Joi.string().required(),
        originalname: Joi.string().required(),
        fieldname: Joi.string().required(),
    }),
    id: Joi.string().custom(objectValidator).required(),
    header: Joi.object({
        "cache-control": Joi.string(),
        "postman-token": Joi.string(),
        "content-type": Joi.string(),
        "content-length": Joi.string(),
        host: Joi.string(),
        "user-agent": Joi.string(),
        accept: Joi.string(),
        "accept-encoding": Joi.string(),
        connection: Joi.string(),
        token: Joi.string().required(),
    })
}