/*
 * Parse swagger validation error and return an error message.
 */
function parseSwaggerError(error) {
  if (error.path && error.path.length > 0) {
    return `\`${error.path}\` ${error.message}`;
  }
  return error.message;
}

/**
 * Middleware to add to the end of the middleware chain for handling errors.
 *
 * @param {Object} log -  Log object to use within the middleware
 * @param {String} serviceName - The name of the service using this middleware
 *  (defaults to `unknown`)
 * @returns {Function} errorHandlerMiddleware - the middleware to handle error responses
 */
function errorHandler(log, serviceName = 'unknown') {
  return function errorHandlerMiddleware(err, req, res, next) {
    if (!err) {
      next();
      return;
    }

    if (!res.statusCode || res.statusCode < 400) {
      res.statusCode = err.statusCode || 500;
    }

    const response = {};
    response.message = err.message || 'An unknown error has occurred';

    if (err.failedValidation) {
      // special handling for swagger validation errors
      response.message = 'Validation failed';

      if (err.results && err.results.errors) {
        response.validationErrors = err.results.errors.map(error => parseSwaggerError(error));
      } else {
        response.validationErrors = [err.message];
      }
    } else if (err.isJoi) {
      // special handling for joi validation errors
      response.message = 'Validation failed';
      res.statusCode = 400;

      if (err.details) {
        response.validationErrors = err.details.map(error => error.message);
      } else {
        response.validationErrors = [err.message];
      }
    } else if (err.validationErrors) {
      // special handling for manually created validation errors
      // (i.e. err.validationErrors = ['error',...])
      response.message = 'Validation failed';
      response.validationErrors = err.validationErrors;
    } else if (err.name === 'StatusCodeError') {
      /**
       * special handling for request library errors - this occurs when calling
       * other services via the request-as-promised library. The exception that is thrown
       * will be in the format:
       *
       * {
       *   message: '400 - {"message": 'error'}',
       *   statusCode: 400,
       *   error: {
       *     message: 'error',
       *     // this depends on the type of error and service being called
       *     validationErrors|providerErrors|apiErrors: ...
       *   }
       * }
       */
      response.message = err.error.message || 'API error';
      response.apiErrors = [];
      if (err.error) {
        // are there any swagger or Joi errors?
        if (err.error.validationErrors) {
          response.apiErrors = response.apiErrors.concat(err.error.validationErrors);
        }
        // any bandwidth or other provider errors?
        if (err.error.providerErrors) {
          response.apiErrors = response.apiErrors.concat(err.error.providerErrors);
        }
        // any upstream API errors?
        if (err.error.apiErrors) {
          response.apiErrors = response.apiErrors.concat(err.error.apiErrors);
        }
      }
    }

    /**
     * keep track of which service the error came from.
     *
     * Look for the service on the remote error first (in the case of an StatusCodeError),
     * then check to see if we have manually set a source, or default it to this service.
     */
    response.sourceService = err.sourceService || (err.error && err.error.sourceService) || serviceName;

    if (res.statusCode >= 500) {
      log.error({
        req, err, statusCode: res.statusCode, sourceService: response.sourceService,
      }, '5XX error response');
      if (process.env.NODE_ENV !== 'production') {
        response.stack = err.stack;
      }
    } else {
      log.warn({
        req, err, statusCode: res.statusCode, sourceService: response.sourceService,
      }, '4XX error response');
    }

    res.status(res.statusCode).json(response);
  };
}

module.exports = errorHandler;
