require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
// const bodyParser = require("body-parser"); N'est pas utilisé, Formidable à la place
const cors = require("cors");
const formidableMiddleware = require("express-formidable"); // Permet le parsing ?? la récupération de files
const cloudinary = require("cloudinary").v2;
const SHA256 = require("crypto-js/sha256"); // Crypto hash generator
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//Importation des modèles
const Offer = require("./models/Offer");
const User = require("./models/User");

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// CRéation du serveur

const app = express();

// app.use(bodyParser.json()); N'est pas utilisé, Formidable à la place

// pour que le serveur accepte toute les connexions
app.use(cors());

app.use(formidableMiddleware());

// Middlewares

const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.status(401).json({
      error: "Missing Authorization Header"
    });
    return;
  }
  const parts = req.headers.authorization.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    res.status(401).json({
      error: "Invalid Authorization Header"
    });
    return;
  }
  const token = parts[1];
  const user = await User.findOne({ token });
  if (!user) {
    res.status(401).json({
      error: "Invalid Token"
    });
    return;
  }
  return next();
};
// ******

const uploadPicture = (req, res, next) => {
  try {
    if (Object.keys(req.files).length) {
      cloudinary.uploader.upload(
        req.files.pictures.path,
        async (error, result) => {
          if (error) {
            return res.json({ error: "Upload Error" });
          } else {
            req.pictures = result.secure_url;
            next();
          }
        }
      );
    } else {
      req.pictures = "";
      next();
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ message: "An error occurred uploading picture" });
  }
};
// Création des routes
// ================================ Route Get ===========

app.get("/", (req, res) => {
  // req = request
  // res = response
  res.json({ message: "Hello World" });
});

// ================================ Route Sign_up =======

app.post("/api/user/sign_up", async (req, res) => {
  console.log("route sign_up OK");

  try {
    const token = uid2(64);
    const salt = uid2(64);
    const hash = SHA256(req.fields.password + salt).toString(encBase64);
    const newUser = new User({
      email: req.fields.email,
      username: req.fields.username,
      hash: hash,
      salt: salt,
      token: token
    });
    console.log("test from front " + token);

    await newUser.save();
    res.json({
      _id: newUser._id,
      token: newUser.token,
      account: {
        username: newUser.username
      }
    });
  } catch (e) {
    console.error(e.message);
    res.status(400).json({ message: "An error occurred" });
  }
});

// ================================ Route Login ========

app.post("/api/user/log_in", async (req, res) => {
  console.log("route log_in OK");
  try {
    await User.findOne({ email: req.fields.email }).exec(function(err, user) {
      if (err) return next(err.message);
      if (user) {
        if (
          SHA256(req.fields.password + user.salt).toString(encBase64) ===
          user.hash
        ) {
          return res.json({
            _id: user._id,
            token: user.token,
            account: user.account
          }); // Ce return ne marche pas why ??
        } else {
          return res.status(401).json({ error: "Unauthorized" });
        }
      } else {
        return next("User not found");
      }
    });
  } catch (e) {
    console.error(e.message);
    res.status(400).json({ message: "An error occurred" });
  }
});

// ========================== Route publish ============

app.post(
  "/api/offer/publish",
  authenticate,
  uploadPicture,
  async (req, res) => {
    try {
      const { title, description, price } = req.fields;
      const offer = new Offer({
        title,
        description,
        price
        /* pictures: req.pictures */
      });
      offer.pictures = req.pictures;
      await offer.save();
      res.json({ message: "Offer is published" });
    } catch (e) {
      res.status(400).json({ message: "An error occurred" });
    }
  }
);

// Définition du port du serveur ====================

app.listen(process.env.PORT, () => {
  console.log("Server has started on port 4000");
});
