const express = require("express");
const formidableMiddleware = require("express-formidable");

const router = express.Router();
router.use(formidableMiddleware());

//Importation des modèles
const Offer = require("../models/Offer");
const User = require("../models/User");

// Read =================================================================

router.get("/api/offers/with-count", async (req, res) => {
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

module.exports = router;
