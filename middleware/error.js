const errorHandler = (err, req, res, next) => {
  // Log console for the developer
  console.log(err.stack.red);

  res.status(err.statusCode || 500).json({
    success: false,
    err: err.message || 'Server Error',
  });
};

module.exports = errorHandler;
