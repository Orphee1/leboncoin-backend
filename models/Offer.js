const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ""
  },
  price: {
    type: Number,
    required: true
  },
  created: {
    type: String,
    required: true
  },
  pictures: {
    type: String,
    default: ""
  },
  category: {
    type: String,
    default: ""
  },
  location: {
    type: String,
    default: ""
  },
  creator: {
    type: String,
    required: true
  }
  // creator: {
  //   account: {
  //     username: String
  //     // required: true
  //   }
});

module.exports = Offer;
