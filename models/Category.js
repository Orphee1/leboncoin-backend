const mongoose = require('mongoose')

const Category = mongoose.model('Category', {
  title: {
    type: String,
    required: true,
  },
})

module.exports = Category
