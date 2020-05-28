const express = require("express");
const formidableMiddleware = require("express-formidable");
const bodyParser = require("body-parser");

const router = express.Router();

// Model import
const Category = require("../models/Category");

// Read =======================================================================

// Create =====================================================================

router.post("/api/category/create", async (req, res) => {
      console.log("route category create OK");
      console.log(req.fields);

      try {
            const newCategory = new Category({
                  title: req.fields.title,
            });
            await newCategory.save();
            res.status(200).json(newCategory);
      } catch (error) {
            console.log(error.message);
            res.status(400).json({ message: error.message });
      }
});

module.exports = router;
