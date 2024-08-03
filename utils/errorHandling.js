import AppError from "./AppError.js";

export const asyncHandling = (fn) => {
    return (req, res, next) => {
        fn(req, res, next)
            .catch((err) => {
                next(err)
            })
    }

}
// Global error handling middleware
export const globalErrorHandling = (err, req, res, next) => {
    if (res.headersSent) {
        return next(err); // If headers are already sent, delegate to the default Express error handler
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            details: err.message.details,

            stack:err.stack
            
        });
    } else {
        console.error('Unexpected Error:', err); // Log the detailed error internally for debugging

        // Handle unknown errors and provide specific information in the response
        res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred',
            error: err.message, // Include specific error message
            stack:err.stack

        
        });
    }

    // Ensure the error is passed to any further error handling middleware
    next(err);
};