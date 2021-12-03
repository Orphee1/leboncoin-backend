const { StatusCodes } = require('http-status-codes')
const User = require('../models/User')
// const BadRequestError = require('../errors/bad-request')

const SHA256 = require('sha256')

const asyncWrapper = require('../middlewares/async')

const register = asyncWrapper(async (req, res) => {
  console.log('route sign_up OK')
  const { email, username, password } = req.body
  const emailAlreadyUsed = await User.findOne({ email })
  if (emailAlreadyUsed) {
    console.log('Here')
    throw new Error('This email is already in use, please provide an other one')
  }
  const user = await User.create({ email, username, password })
  res.status(StatusCodes.OK).json({ user })
})

const login = asyncWrapper(async (req, res) => {
  console.log('route log_in OK')
  const { email, password } = req.body
  console.log(req.body)
  const user = await User.findOne({ email: email })
  if (user) {
    res.status(StatusCodes.OK).json({ user })
  } else {
    throw new Error('This user does not exist')
  }
})

module.exports = { register, login }
