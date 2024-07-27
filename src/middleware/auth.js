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

        console.log(newToken)


        let decoded = jwt.verify(newToken, process.env.JWT_SECRET);

        console.log(decoded)

        const user = await userModel.findById(decoded.id);
        if (!user) return next(new AppError('User not found', 400));


        req.user = user;

        // Authorization
        if (roles.length && !roles.includes(user.role)) {
            return next(new AppError('You do not have permission', 403));
        }


        // if (parseInt(user.passwordChangedAt.getTime() / 1000) > decoded.iat) return next(new AppError('Token is expired, please login again', 400));

        req.user = user;
        console.log(req)
        next();
     
    });
};
















// // export const auth = (roles = []) => {
// //     return async (req, res, next) => {
// //         try {
// //         // Authentication
// //         const { token } = req.headers;
// //         if (!token) return next(new AppError('Token not found', 404));

// //         const bearer = process.env.JWT_BEARER;
// //         if (!token.startsWith(bearer)) return next(new AppError('Invalid Bearer', 400));

// //         const newToken = token.slice(bearer.length).trim();
// //         if (!newToken) return next(new AppError('Invalid Token', 400));

// //         const decoded = jwt.verify(newToken, process.env.JWT_SECRET);
// //         if (!decoded) return next(new AppError('Invalid token payload', 400));

// //         const user = await userModel.findOne({ email: decoded.email });
// //         if (!user) return next(new AppError('User does not exist', 400));

// //         // Authorization
// //         if (!roles.includes(user.role)) return next(new AppError('You do not have permission', 403));

// export const auth = (...roles) => {
//     return async (req, res, next) => {
//         // try {
//             // Authentication
//             const {token} = req.headers;
//             if (!token) return next(new AppError('Token not found', 404));
//             const bearer = process.env.JWT_BEARER;
//             if (!token.startsWith(bearer)) return next(new AppError('Invalid Bearer', 400));

//             const newToken = token.slice(bearer.length).trim();
//             const decoded = jwt.verify(newToken, process.env.JWT_SECRET);
//             if (!decoded) return next(new AppError('Invalid signature', 400));

//             const user = await userModel.findById(decoded.id);
//             if (!user) return next(new AppError('User is invalid', 400));

//             req.user = user;

//             // Authorization
//             if (roles.length && !roles.includes(user.role)) {
//                 return next(new AppError('You do not have permission', 403));
//             }


//         if (parseInt(user.passwordChangedAt.getTime() / 1000) > decoded.iat) return next(new AppError('Token is expired, please login again', 400));

//         req.user = user;
//         console.log(req)
//         next();
//     //     } catch (error) {
//     //         if (error.name === 'JsonWebTokenError') {
//     //             return next(new AppError('Invalid token', 400));
//     //         }
//     //         next(error);
//     //     }
//      };
// };

// // export default auth;
