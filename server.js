require("dotenv").config();

// Server creation
const express = require("express");
const cors = require("cors");
const formidableMiddleware = require("express-formidable");

const app = express();
app.use(cors());
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
const Offer = require("./models/Offer");
const User = require("./models/User");

// Loading Routes
const offerRoutes = require("./routes/offer");
const offersRoutes = require("./routes/offers");
const userRoutes = require("./routes/user");

// Use Routes
app.use(offerRoutes);
app.use(offersRoutes);
app.use(userRoutes);

// Port definition
app.listen(process.env.PORT, () => {
  console.log("Server has started on port " + process.env.PORT);
});
