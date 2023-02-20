const express = require('express')
const router = express.Router()

// Controllers import
const { getAllOffers } = require('../controllers/offersController')

router.route('/').get(getAllOffers)

module.exports = router
