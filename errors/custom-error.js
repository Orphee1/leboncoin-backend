class CustomAPIError extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode
  }
}

const createCustomError = (msg, st) => {
  return new CustomAPIError(msg, st)
}

module.exports = { CustomAPIError, createCustomError }
