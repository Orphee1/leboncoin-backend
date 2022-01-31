const { UnauthenticatedError } = require('../errors')

const asyncWrapper = require('./async')

const authenticate = asyncWrapper(async (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth) {
    throw new UnauthenticatedError('Missing Authorization Header')
  }
  const parts = req.headers.authorization.split(' ')

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new UnauthenticatedError('Invalid Authorization Header')
  }
  next()
})

module.exports = authenticate
