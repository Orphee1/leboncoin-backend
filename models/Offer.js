const mongoose = require('mongoose')

const OfferSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
  created: {
    type: String,
    required: true,
  },
  pictures: {
    type: String,
    default: '',
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  },

  location: {
    type: String,
    default: '',
  },

  creator: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model('Offer', OfferSchema)
