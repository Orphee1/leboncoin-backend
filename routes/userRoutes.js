const express = require('express')
const router = express.Router()

// Controllers import

const {
  register,
  login,
  verifyEmail,
} = require('../controllers/authControllers')

router.post('/log_in', login)
router.post('/sign_up', register)
router.post('/verify-email', verifyEmail)

module.exports = router
