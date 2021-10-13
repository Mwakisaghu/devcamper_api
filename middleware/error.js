const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  error.message = err.message;

  // Log console for the developer
  console.log(err.stack.red);

  //Mongoose Bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with an id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }
  //console.log(err.name);

  res.status(error.statusCode || 500).json({
    success: false,
    err: error.message || 'Server Error',
  });
};

module.exports = errorHandler;
