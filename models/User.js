const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: String,
  username: String, // Je n'ai pas à créer l'ID??
  hash: String,
  salt: String,
  token: String
});

module.exports = User;
