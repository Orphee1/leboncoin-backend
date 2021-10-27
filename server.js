require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const formidableMiddleware = require('express-formidable')

app.use(cors())
app.use(formidableMiddleware())

const connectDB = require('./db/connect')

// Middlewares
const notFound = require('./middlewares/notfound')
const errorHandlerMiddleware = require('./middlewares/error-handler')

// Loading Routes
const offerRoutes = require('./routes/offer')
const offersRoutes = require('./routes/offers')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')

// Use Routes
app.use('/api/v1/offer', offerRoutes)
// app.use('/api/v1/offers/with-count', offersRoutes)
app.use('/api/v1/offers', offersRoutes)
app.use(userRoutes)
app.use(categoryRoutes)

app.use(notFound)
app.use(errorHandlerMiddleware)

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI)
    app.listen(
      process.env.PORT,
      console.log(
        `Connected to DB... \nServer is listening on port ${process.env.PORT}...`
      )
    )
  } catch (error) {
    console.log(error)
  }
}

start()
