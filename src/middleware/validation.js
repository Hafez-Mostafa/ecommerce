
import AppError from '../../utils/AppError.js';
const dataMethod = ['body', 'query', 'params', 'headers', 'file', 'files'];

export const validation = (schema) => {
    return (req, res, next) => {
        let errorsList = [];

        dataMethod.forEach((key) => {
            if (schema[key]) {
                const { error } = schema[key].validate(req[key], { abortEarly: false });
             
                if (error) {
                    error.details.forEach((err) => {
                        errorsList.push(err.message)
                    });
                }
            }
        });
        if (errorsList.length > 0) {
            return next(new AppError(`Validation Error:\n${errorsList.join('\\n')}`, 400));
        }

        next();
    };
};
   //     if (error?.details) {
                //         error.details.forEach((detail) => {
                //             errorsList.push(`${key}: ${detail.message}`);
                //         });
                //     }
                // }
                //  });
                // if (errorsList.length > 0) {
                //     const errorMessage = `Validation Error:\n${errorsList.join('\n')}`;
                //     return next(new AppError(errorMessage, 400));
                // }