

// import AppError from '../../utils/AppError.js';
// const dataMethod = ['body', 'query', 'params', 'headers', 'file', 'files'];

// export const validation = (schema) => {
//     return (req, res, next) => {
//         let errorsList = [];
//         dataMethod.forEach((key) => {
//             if (schema[key]) {
//                 const { error } = schema[key].validate(req[key], { abortEarly: false });
//                 if (error?.details) {
//                     error.details.forEach((detail) => {
//                         errorsList.push(detail.message);
//                     });
//                 }
//             }
//         });

//         if (errorsList.length > 0) {
//             const errorMessage = `Validation Error:\n ${errorsList.join('\n ')}`;
//             return next(new AppError(errorMessage, 400));
//         }

//         next();
//     };
// };
import AppError from '../../utils/AppError.js';
const dataMethod = ['body', 'query', 'params', 'headers', 'file', 'files'];

export const validation = (schema) => {
    return (req, res, next) => {
        let errorsList = [];
        
        dataMethod.forEach((key) => {
            if (schema[key]) {
                const { error } = schema[key].validate(req[key], { abortEarly: false });
                if (error?.details) {
                    error.details.forEach((detail) => {
                        errorsList.push(`${key}: ${detail.message}`);
                    });
                }
            }
        });

        if (errorsList.length > 0) {
            const errorMessage = `Validation Error:\n${errorsList.join('\n')}`;
            return next(new AppError(errorMessage, 400));
        }

        next();
    };
};
