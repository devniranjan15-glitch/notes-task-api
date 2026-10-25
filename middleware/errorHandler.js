function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.name === "ValidationError") {
    const details = Object.values(error.errors).map((item) => ({
      field: item.path,
      message: item.message
    }));
    return res.status(400).json({
      success: false,
      error: { message: "Validation failed", details }
    });
  }

  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: { message: "Invalid identifier or value" }
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      error: { message: "A record with this value already exists" }
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    error: { message: "Internal server error" }
  });
}

module.exports = errorHandler;
