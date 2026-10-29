const validate = (schema) => {
  return (req, res, next) => {
    try {
      if (!schema || typeof schema.validate !== "function") {
        return res.status(500).json({
          success: false,
          message: "Invalid validation schema configuration",
        });
      }

      const result = schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (result.error) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.details.map(
            (detail) => detail.message
          ),
        });
      }

      req.body = result.value;
      return next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = validate;