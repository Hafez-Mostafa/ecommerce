import path from 'path';
import dotenv from "dotenv";
dotenv.config({ path: path.resolve('config/.env') });
import AppError from "../../utils/AppError.js";
import jwt from 'jsonwebtoken';
import userModel from "../../db/models/user.model.js";
import { asyncHandling } from '../../utils/errorHandling.js';




export const auth = (roles = []) => {
    return asyncHandling(async (req, res, next) => {
        // Authentication
        const { token } = req.headers;
        if (!token || !token.startsWith(process.env.JWT_BEARER)) {
            return next(new AppError('Token not found or invalid Bearer', 404));
        }
        let newToken = token.slice(process.env.JWT_BEARER.length).trim();

        // console.log(newToken)


        let decoded = jwt.verify(newToken, process.env.JWT_SECRET);

        // console.log(decoded)

        const user = await userModel.findById(decoded.id);
        if (!user) return next(new AppError('User not found', 400));


        req.user = user;

        // Authorization
        if (roles.length && !roles.includes(user.role)) {
            return next(new AppError('You do not have permission', 403));
        }


        // if (parseInt(user.passwordChangedAt.getTime() / 1000) > decoded.iat) return next(new AppError('Token is expired, please login again', 400));

        req.user = user;
        // console.log(req)
        next();
     
    });
};

