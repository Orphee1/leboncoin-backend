const express = require('express')
const router = express.Router()

// Controllers import
const { getAllOffers } = require('../controllers/offers')

router.route('/').post(getAllOffers)

module.exports = router
