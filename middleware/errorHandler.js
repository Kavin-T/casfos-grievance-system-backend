const errorHandler = (err, req, res, next) => {
  let errorMessage = err.message;

  if (err.name === "ValidationError") {
    res.status(400);
    errorMessage = Object.values(err.errors)
      .map((err) => err.message)
      .join("\n");
  } else if (err.code === 11000) {
    res.status(400);
    const fieldName = Object.keys(err.keyValue)[0];
    const fieldValue = err.keyValue[fieldName];
    errorMessage = `${fieldName} already exists with the value "${fieldValue}"`;
  }

  const statusCode = res.statusCode ? res.statusCode : 500;
  res.json({ message: errorMessage, status: statusCode });
};

module.exports = errorHandler;
