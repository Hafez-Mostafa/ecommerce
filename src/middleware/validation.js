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
            return res.status(400).json({message:'Validation error',error:errorsList})
        }

        next();
    };
};
