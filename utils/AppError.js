// class AppError extends Error {
//     constructor(error, statusCode) {
//         super(error)
//         this.statusCode = statusCode
//     }

// }

// export default AppError
class AppError extends Error {
    constructor(error, statusCode) {
        super(error);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
    }
}

export default AppError;
