const express = require("express");
const formidableMiddleware = require("express-formidable");
const bodyParser = require("body-parser");

const router = express.Router();

// Models import
const Category = require("../models/Category");
const Offer = require("../models/Offer");

// Read =================================================================

router.post("/api/offers/with-count/", async (req, res) => {
      console.log("Route offers OK");

      console.log(req.fields);

      try {
            let offers;

            let skip = req.fields.skip;

            let limit = req.fields.limit;
            let limitOk = Number(skip) + Number(limit);

            if (req.fields) {
                  // filter creation
                  const filters = {};
                  if (req.fields.title) {
                        filters.title = new RegExp(req.fields.title, "i");
                  }

                  if (
                        req.fields.category &&
                        req.fields.category !== "Catégories"
                  ) {
                        // Get category's id
                        let category = await Category.findOne({
                              title: req.fields.category,
                        });
                        filters.category = category._id;
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

                  // this populate allows front-end to get category.title
                  offers = await Offer.find(filters).populate("category");

                  if (req.fields.sort) {
                        if (req.fields.sort === "price-asc") {
                              offers.sort(function (a, b) {
                                    return a.price - b.price;
                              });
                        }
                        if (req.fields.sort === "price-desc") {
                              offers.sort(function (a, b) {
                                    return b.price - a.price;
                              });
                        }
                        if (req.fields.sort === "date-desc") {
                              console.log("On est bien ici");
                              offers.sort(function (a, b) {
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
                        }

                        if (req.fields.sort === "date-asc") {
                              console.log("On est bien là");
                              offers.sort(function (a, b) {
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
                        }
                  }
            } else {
                  console.log("here we are");
                  // this populate allows front-end to get category.title
                  offers = await Offer.find().populate("category");
            }

            let response = {
                  count: offers.length,
                  offers: offers.slice(skip, limitOk),
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
