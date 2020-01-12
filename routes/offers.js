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
  // console.log(req);
  console.log(req.query);

  // Création du filtre
  const createFilters = req => {
    const filters = {};
    if (req.query.title) {
      filters.title = new RegExp(req.query.title, "i");
    }
    if (req.query.priceMin) {
      filters.price = {};
      filters.price.$gte = req.query.priceMin;
    }
    if (req.query.priceMax) {
      if (req.query.priceMax !== "----") {
        if (filters.price === undefined) {
          filters.price = {};
        }
        filters.price.$lte = req.query.priceMax;
      }
    }
    return filters;
  };

  try {
    let offers;
    let skip = req.query.skip;
    let limit = req.query.limit;
    let limitOk = Number(skip) + Number(limit);

    if (req.query) {
      const filters = createFilters(req);
      console.log(filters);

      offers = await Offer.find(filters);
      // console.log(offers);

      if (req.query.priceSort) {
        if (req.query.priceSort === "price-asc") {
          offers.sort(function(a, b) {
            return a.price - b.price;
          });
          // offers.sort({ price: 1 });
        }
        if (req.query.priceSort === "price-desc") {
          offers.sort(function(a, b) {
            return b.price - a.price;
          });
          // offers.sort({ price: -1 });
        }
      }
      if (req.query.dateSort) {
        console.log(req.query.dateSort);
        if (req.query.dateSort === "date-desc") {
          console.log("On est bien ici");
          offers.sort(function(a, b) {
            // return a.created - b.created;
            var aa = a.created
                .split("/")
                .reverse()
                .join(),
              bb = b.created
                .split("/")
                .reverse()
                .join();
            return bb < aa ? -1 : bb > aa ? 1 : 0;
          });
          // offers.sort({ created: -1 });
        }
        if (req.query.dateSort === "date-asc") {
          console.log(req.query.dateSort);
          console.log("On est bien là");
          offers.sort(function(a, b) {
            // return b.created - a.created;
            var aa = a.created
                .split("/")
                .reverse()
                .join(),
              bb = b.created
                .split("/")
                .reverse()
                .join();
            return aa < bb ? -1 : aa > bb ? 1 : 0;
          });
          // offers.sort({ created: 1 });
        }
      }
    } else {
      console.log("here we are");
      offers = await Offer.find();
    }

    let response = {
      count: offers.length,
      // offers: offers
      offers: offers.slice(skip, limitOk)
    };
    console.log(skip);
    console.log(limitOk);

    // console.log(response);
    await res.json(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
