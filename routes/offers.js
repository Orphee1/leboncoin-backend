const express = require("express");
const formidableMiddleware = require("express-formidable");

const router = express.Router();
router.use(formidableMiddleware());

//Importation des modèles
const Offer = require("../models/Offer");
const User = require("../models/User");

const createFilters = req => {
  const filters = {};
  if (req.query.title) {
    filters.title = new RegExp(req.query.title, "i");
  }
  return filters;
};

// Read =================================================================

router.get("/api/offers/with-count", async (req, res) => {
  console.log("Route offers OK");

  try {
    let offers;
    let skip = req.query.skip;
    let limit = req.query.limit;
    let limitOk = Number(skip) + Number(limit);

    if (req.query.title) {
      const filters = createFilters(req);
      console.log(filters);

      offers = await Offer.find(filters);
    } else {
      console.log("here we are");
      offers = await Offer.find();
    }

    let response = {
      count: offers.length,
      // offers: offers
      offers: offers.slice(skip, limitOk)
    };
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
