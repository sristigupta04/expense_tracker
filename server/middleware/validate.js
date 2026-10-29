
const validate = (schema) => {
  return (req, res, next) => {
    try {
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
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = validate;
