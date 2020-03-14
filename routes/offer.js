const express = require("express");
const formidableMiddleware = require("express-formidable");

const SHA256 = require("crypto-js/sha256"); // Crypto hash generator
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const router = express.Router();
router.use(formidableMiddleware());

//Importation des modèles
const Offer = require("../models/Offer");
const User = require("../models/User");
const Category = require("../models/Category");

// Importation des middlewares
const authenticate = require("../middlewares/authenticate.js");
const uploadPicture = require("../middlewares/uploadPicture.js");

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

                  const { title, description, price, location } = req.fields;

                  const category = await Category.findOne({
                        title: req.fields.category
                  });
                  console.log(category);
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
                  dateDisplay +=
                        day +
                        "/" +
                        month +
                        "/" +
                        year +
                        " à " +
                        hour +
                        ":" +
                        min;

                  offer.created = dateDisplay;
                  offer.creator = user.username;

                  await offer.save();
                  res.json({ message: "Offer is published" });
            } catch (e) {
                  res.status(400).json({ message: "An error occurred" });
            }
      }
);

// Delete ===============================================================
router.post("/api/offer/delete", async (req, res) => {
      console.log("route offer delete OK");

      try {
            let id = req.query.id;
            console.log(id);

            let offerToDelete = await Offer.findById(id);
            console.log(offerToDelete);
            await offerToDelete.remove();
            res.status(200).json({ message: "Offer removed" });
      } catch (error) {
            console.log(error);
            res.status(400).json({ message: error.message });
      }
});

// Update ===============================================================
router.post("/api/offer/update", async (req, res) => {
      console.log("route offer update OK");

      try {
            let id = req.query.id;
            console.log(id);
            const category = await Category.findOne({
                  title: req.fields.category
            });

            console.log(category);

            let offerToUpdate = await Offer.findById(id);
            console.log(offerToUpdate);

            if (category) {
                  offerToUpdate.category = category;
            }
            await offerToUpdate.save();
            res.status(200).json(offerToUpdate);
      } catch (error) {
            console.log(error);
            res.status(400).json({ message: error.message });
      }
});

module.exports = router;
