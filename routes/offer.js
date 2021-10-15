const express = require('express')
const formidableMiddleware = require('express-formidable')

const router = express.Router()
router.use(formidableMiddleware())

// Controllers import
const {
  createOffer,
  deleteOffer,
  getOffer,
  updateOffer,
} = require('../controllers/offers')

// Middlewares import
const authenticate = require('../middlewares/authenticate.js')
const uploadPicture = require('../middlewares/uploadPicture.js')

router.route('/').get(getOffer).post(authenticate, uploadPicture, createOffer)
router.route('/:id').delete(deleteOffer).patch(updateOffer)

module.exports = router
