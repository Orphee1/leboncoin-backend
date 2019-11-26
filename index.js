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
/*mongoose.connect(
  "mongodb+srv://HugoLattard:180577@cluster0-agmsf.mongodb.net/test",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
);*/

//MONGODB_URI=mongodb://heroku_m2nxm2zr:9sbucln17dg7t2714ce2eqt57d@ds053539.mlab.com:53539/heroku_m2nxm2zr

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
        req.files.pictures.path, // ce pictures, c'est celui renseigné en param du form data en front
        async (error, result) => {
          if (error) {
            return res.json({ error: "Upload Error" });
          } else {
            req.pictures = await result.secure_url; // ??? il faut un await???
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
// ================================ Route Offers ==========

app.get("/api/offers/with-count", async (req, res) => {
  console.log("Route offers OK");

  try {
    let offers;
    let skip = req.query.skip;
    let limit = req.query.limit;
    let limitOk = skip + limit;

    /*if (req.query.title) {
      filter = req.query.title;
      console.log("coucou" + filter);

      offers = await Offer.find(filter);
    } 
    else {
      
    } */
    offers = await Offer.find();

    let response = {
      count: offers.length,
      offers: offers.slice(skip, limitOk)
    };

    await res.json(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
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
        console.log("jusqu'ici tout va bien");
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
        /*return next("User not found"); CE NEXT FAIT BUGGER SI PAS DE USER */

        return res.json({ message: "user not found" }); // Pourquoi l'erreur n'est pas passée dans le catch??
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
      offer.created = new Date();
      await offer.save();
      res.json({ message: "Offer is published" });
      console.log("publish oK");
    } catch (e) {
      res.status(400).json({ message: "An error occurred" });
    }
  }
);

// Définition du port du serveur ====================

app.listen(process.env.PORT, () => {
  console.log("Server has started on port 4000");
});
