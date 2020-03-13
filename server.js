require("dotenv").config();

// Server creation
const express = require("express");
const cors = require("cors");
const app = express();
const formidableMiddleware = require("express-formidable");
const bodyParser = require("body-parser");

app.use(cors());
app.use(bodyParser.json());
app.use(formidableMiddleware());
// Database config
const mongoose = require("mongoose");
mongoose.connect(
      process.env.MONGODB_URI,

      {
            useNewUrlParser: true,
            useUnifiedTopology: true
      }
);

// Loading models
const Category = require("./models/Category");
const Offer = require("./models/Offer");
const User = require("./models/User");

// Loading Routes
const offerRoutes = require("./routes/offer");
const offersRoutes = require("./routes/offers");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");

// Use Routes
app.use(offerRoutes);
app.use(offersRoutes);
app.use(userRoutes);
app.use(categoryRoutes);

// Test Route
app.get("/", async (req, res) => {
      try {
            res.json({ message: "hello Leboncoin" });
      } catch (error) {
            console.log(error.message);
            res.status(400).json(error.message);
      }
});

// Port definition
app.listen(process.env.PORT, () => {
      console.log("Server has started on port " + process.env.PORT);
});
