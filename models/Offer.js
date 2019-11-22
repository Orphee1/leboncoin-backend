const mongoose = require("mongoose");

const Offer = mongoose.model("Offer", {
  title: String,
  description: String,
  price: Number,
  pictures: String
  /*creator: {
    account: {
      username: String
    }
  }*/
});

module.exports = Offer;
