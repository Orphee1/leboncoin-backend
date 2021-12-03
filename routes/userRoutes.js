const express = require('express')
const router = express.Router()

// Controllers import

const { register, login } = require('../controllers/authControllers')

router.post('/log_in', login)

router.post('/sign_up', register)

module.exports = router
