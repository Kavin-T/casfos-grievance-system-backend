const errorHandler = (err, req, res, next) => {
    let errorMessage = err.message;
    console.log(err);

    if (err.name === 'ValidationError') {
        res.status(400);  // Set status for validation errors
        errorMessage = Object.values(err.errors).map((err) => err.message).join('\n');
    } else if (err.code === 11000) {  // Duplicate key error (E11000)
        res.status(400);  // Set status to 400 for duplicate key errors
        const fieldName = Object.keys(err.keyValue)[0]; // Get the field causing the duplicate
        const fieldValue = err.keyValue[fieldName]; // Get the duplicate value
        errorMessage = `${fieldName} already exists with the value "${fieldValue}"`;  // Custom error message
    } else {
        res.status(500);  // Internal server error for other cases
    }

    const statusCode = res.statusCode ? res.statusCode : 500;  // Default to 500 if no status code is set
    res.json({ message: errorMessage, status: statusCode});
};

module.exports = errorHandler;
