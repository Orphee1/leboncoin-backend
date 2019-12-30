const express = require("express");
const formidableMiddleware = require("express-formidable"); // Permet le parsing ?? la récupération de files
const cloudinary = require("cloudinary").v2;
const SHA256 = require("crypto-js/sha256"); // Crypto hash generator
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const router = express.Router();
router.use(formidableMiddleware());

//Importation des modèles
const Offer = require("../models/Offer");
const User = require("../models/User");

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

// Read ================================================================= Offer ??

// Create ===============================================================

router.post(
  "/api/offer/publish",
  authenticate,
  uploadPicture,
  async (req, res) => {
    console.log("route publish OK");
    try {
      const { title, description, price, category, location } = req.fields;
      const offer = new Offer({
        title,
        description,
        price,
        category,
        location
        /* pictures: req.pictures */
      });
      offer.pictures = req.pictures;
      // const date = new Date().toDateString();
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth();
      const day = date.getDate();
      const hour = date.getHours();
      const min = date.getMinutes();

      let dateDisplay = "";
      dateDisplay += day + "/" + month + "/" + year + " à " + hour + ":" + min;
      console.log(dateDisplay);

      offer.created = dateDisplay;
      console.log(offer.created); //
      await offer.save();
      res.json({ message: "Offer is published" });
    } catch (e) {
      res.status(400).json({ message: "An error occurred" });
    }
  }
);

module.exports = router;