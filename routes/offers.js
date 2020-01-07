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
      if (filters.price === undefined) {
        filters.price = {};
      }
      filters.price.$lte = req.query.priceMax;
    }
    return filters;
  };

  try {
    let offers;
    let skip = req.query.skip;
    let limit = req.query.limit;
    let limitOk = Number(skip) + Number(limit);

    if (req.query) {
      console.log(req.query);
      const filters = createFilters(req);
      console.log(filters);

      offers = await Offer.find(filters);
      console.log(offers);

      if (req.query.priceSort) {
        console.log(req.query.priceSort);
        if (req.query.priceSort === "price-asc") {
          console.log("On est bien ici");
          offers.sort(function(a, b) {
            return a.price - b.price;
          });
          // offers.sort({ price: 1 });
        }
        if (req.query.priceSort === "price-desc") {
          console.log("On est bien là");
          offers.sort(function(a, b) {
            return b.price - a.price;
          });
          // offers.sort({ price: -1 });
        }
        console.log(offers);
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

    console.log(response);
    await res.json(response);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }

  // const filter = {};
  // if (
  //   (req.query.priceMin !== undefined && req.query.priceMin !== "") ||
  //   (req.query.priceMax !== undefined && req.query.priceMax !== "")
  // ) {
  //   filter.price = {};
  //   if (req.query.priceMin) {
  //     filter.price["$gte"] = req.query.priceMin;
  //   }
  //   if (req.query.priceMax) {
  //     filter.price["$lte"] = req.query.priceMax;
  //   }
  // }

  // if (req.query.title) {
  //   filter.title = {
  //     $regex: req.query.title,
  //     $options: "i"
  //   };
  // }

  // const query = Offer.find(filter);
  // console.log(query);
  // // const query = Offer.find(filter).populate({
  // //   path: "creator",
  // //   select: "account"
  // // });

  // switch (req.query.sort) {
  //   case "price-desc":
  //     query.sort({ price: -1 });
  //     break;
  //   case "price-asc":
  //     query.sort({ price: 1 });
  //     break;
  //   case "date-desc":
  //     query.sort({ created: -1 });
  //     break;
  //   case "date-asc":
  //     query.sort({ created: 1 });
  //     break;
  //   default:
  // }

  // let response = {
  //   count: query.length,
  //   offers: query.slice(skip, limitOk)
  // };
  // await res.json(response);

  // query.exec(function(err, response) {
  //   res.json(response);
  // });
});

module.exports = router;
