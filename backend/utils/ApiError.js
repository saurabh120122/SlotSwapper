class ApiError extends Error {
  /**
   * @param {number} statusCode
   * @param {string} message
   * @param {Array} errors
   * @param {string} stack
   */
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null; // Standardizing the response
    this.message = message;
    this.success = false; // ApiError always means failure
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };