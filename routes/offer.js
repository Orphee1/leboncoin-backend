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
  // console.log(user);
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

// Read =================================================================
router.get("/api/offer", async (req, res) => {
  console.log("route Offer OK");

  try {
    const id = req.query.id;
    console.log(id);
    let offerToFind = await Offer.findById(id);
    let user = offerToFind.creator;
    console.log(user);

    // get all announces from the creator
    const query = Offer.find({ creator: user }); //
    query.getFilter();
    const offersFromCreator = await query.exec();
    // console.log(offersFromCreator);
    const announcesNumber = offersFromCreator.length;
    console.log(announcesNumber);

    if (offerToFind) {
      res.status(200).json([offerToFind, announcesNumber]);
    } else {
      res.status(400).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Create ===============================================================

router.post(
  "/api/offer/publish",
  authenticate,
  uploadPicture,
  async (req, res) => {
    console.log("route publish OK");

    try {
      const parts = req.headers.authorization.split(" ");
      const token = parts[1];
      const user = await User.findOne({ token });
      console.log(user.username);

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
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let hour = date.getHours();
      let min = date.getMinutes();

      if (day < 10) {
        day = `0${day.toString()}`;
      }

      if (month < 10) {
        month = `0${month.toString()}`;
      }

      if (hour < 10) {
        hour = `0${hour.toString()}`;
      }

      if (min < 10) {
        min = `0${min.toString()}`;
      }

      let dateDisplay = "";
      dateDisplay += day + "/" + month + "/" + year + " à " + hour + ":" + min;

      offer.created = dateDisplay;
      offer.creator = user.username;

      await offer.save();
      res.json({ message: "Offer is published" });
    } catch (e) {
      res.status(400).json({ message: "An error occurred" });
    }
  }
);

module.exports = router;
