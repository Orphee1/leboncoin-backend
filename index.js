const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

mongoose.connect("mongodb://localhost/leboncoin-back-end"),
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };

// Créer un model

const User = mongoose.model("User", {
  email: String,
  username: String,
  password: String
});

// CRéation du serveur

const app = express();

app.use(bodyParser.json());

// Création des routes

app.get("/", (req, res) => {
  // req = request
  // res = response
  res.json({ message: "Hello World" });
});

app.post("/user/sign_up", async (req, res) => {
  console.log("route sign_up OK");

  try {
    const newUser = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password
    });
    await newUser.save();
    res.json(newUser);
  } catch (e) {
    console.error(e.message);
    res.status(400).json({ message: "An error occurred" });
  }
});

app.listen(4000, () => {
  console.log("Server has started on port 4000");
});
