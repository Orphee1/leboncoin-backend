const { StatusCodes } = require('http-status-codes')
const { CustomAPIError } = require('../errors/custom-error')

const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(`errorHandlerMiddleware is saying: ${err}`)

  let customError = {
    //set default
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, try again later',
  }

  // if (err instanceof CustomAPIError) {
  //   return res.status(err.statusCode).json({ msg: err.message })
  // }
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for ${Object.keys(
      err.keyValue
    )} field, please provide an other one `
    customError.statusCode = StatusCodes.BAD_REQUEST
  }
  return res.status(customError.statusCode).json({
    msg: customError.msg,
  })
  // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
  //   msg: err.message,
  // })
}

module.exports = errorHandlerMiddleware
