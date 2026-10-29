const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || "Internal server error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  // Invalid MongoDB ID
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID or data format";
  }

  // Duplicate record
  if (err.code === 11000) {
    statusCode = 409;
    message = "This record already exists";
  }

  // Hide internal server details from clients
  if (statusCode >= 500) {
    message = "Internal server error";
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
4