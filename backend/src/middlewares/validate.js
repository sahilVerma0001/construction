const { ZodError } = require('zod');
const AppError = require('../utils/AppError');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      // Zod validation errors — map to clean string
      const errorMessage = error.errors
        .map((err) => `${err.path.slice(1).join('.')}: ${err.message}`)
        .join(', ');
      return next(new AppError(`Validation Error: ${errorMessage}`, 400));
    }
    // Unexpected error — pass to global error handler
    return next(new AppError('Request validation failed. Please check your input.', 400));
  }
};

module.exports = validate;
