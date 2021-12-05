const { StatusCodes } = require('http-status-codes')
const User = require('../models/User')
const { createJWT, createTokenUser } = require('../utils')

const { BadRequestError, UnauthenticatedError } = require('../errors')

const asyncWrapper = require('../middlewares/async')

const register = asyncWrapper(async (req, res) => {
  const { email, username, password } = req.body
  const emailAlreadyUsed = await User.findOne({ email })
  if (emailAlreadyUsed) {
    throw new Error('This email is already in use, please provide an other one')
  }
  const user = await User.create({ email, username, password })
  const tokenUser = createTokenUser(user)
  const token = createJWT({ payload: tokenUser })

  res.status(StatusCodes.CREATED).json({ user: tokenUser, token })
})

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }
  const user = await User.findOne({ email: email })
  if (!user) {
    throw new UnauthenticatedError('Sorry dude, no user found with this email')
  }

  const isPasswordValid = await user.comparePassword(password)

  if (!isPasswordValid) {
    throw new UnauthenticatedError('Invalid password')
  }

  const tokenUser = createTokenUser(user)
  const token = createJWT({ payload: tokenUser })
  res.status(StatusCodes.OK).json({ user: tokenUser, token })
})

module.exports = { register, login }
