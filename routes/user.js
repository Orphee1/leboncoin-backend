const express = require("express");
const formidableMiddleware = require("express-formidable");

const router = express.Router();
router.use(formidableMiddleware());

const SHA256 = require("crypto-js/sha256"); // Crypto hash generator
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

//Importation des modèles
const Offer = require("../models/Offer");
const User = require("../models/User");

// Read =======================================================================

router.post("/api/user/log_in", async (req, res) => {
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

// Create =====================================================================

router.post("/api/user/sign_up", async (req, res) => {
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

module.exports = router;