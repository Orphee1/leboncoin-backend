const express = require("express");
const formidableMiddleware = require("express-formidable");
const bodyParser = require("body-parser");

const router = express.Router();
router.use(formidableMiddleware());
// router.use(bodyParser.json());

//Importation des modèles
const Offer = require("../models/Offer");
const User = require("../models/User");

// Read =================================================================

router.post("/api/offers/with-count/", async (req, res) => {
      console.log("Route offers OK");
      // res.status(200).json({ message: "route offers OK" });

      console.log(req.fields);

      // Création du filtre
      const createFilters = req => {
            const filters = {};
            if (req.fields.searchTitle) {
                  filters.title = new RegExp(req.fields.searchTitle, "i");
            }

            if (req.fields.category) {
                  filters.category = req.fields.category;
            }
            if (req.fields.priceMin) {
                  filters.price = {};
                  filters.price.$gte = req.fields.priceMin;
            }
            if (req.fields.priceMax) {
                  if (req.fields.priceMax !== "----") {
                        if (filters.price === undefined) {
                              filters.price = {};
                        }
                        filters.price.$lte = req.fields.priceMax;
                  }
            }
            console.log(filters);
            return filters;
      };

      try {
            let offers;
            let skip = req.fields.skip;
            let limit = req.fields.limit;
            let limitOk = Number(skip) + Number(limit);

            if (req.fields) {
                  const filters = createFilters(req);
                  // console.log(filters);

                  offers = await Offer.find(filters);
                  // console.log(offers);

                  if (req.fields.sort) {
                        if (req.fields.sort === "price-asc") {
                              offers.sort(function(a, b) {
                                    return a.price - b.price;
                              });
                              // offers.sort({ price: 1 });
                        }
                        if (req.fields.sort === "price-desc") {
                              offers.sort(function(a, b) {
                                    return b.price - a.price;
                              });
                              // offers.sort({ price: -1 });
                        }
                        if (req.fields.sort === "date-desc") {
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

                        if (req.fields.sort === "date-asc") {
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
