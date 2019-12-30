const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  username: String,
  hash: String,
  salt: String,
  token: String
});

module.exports = User;
