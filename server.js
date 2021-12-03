require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const formidableMiddleware = require('express-formidable')
const fileUpload = require('express-fileupload')

app.use(cors())
// app.use(formidableMiddleware())
app.use(express.json())
// app.use(fileUpload({ useTempFiles: true }))

const connectDB = require('./db/connect')

// Middlewares
const notFound = require('./middlewares/notfound')
const errorHandlerMiddleware = require('./middlewares/error-handler')

// Loading Routes
const offerRoutes = require('./routes/offerRoutes')
const offersRoutes = require('./routes/offersRoutes')
const userRoutes = require('./routes/userRoutes')
const categoryRoutes = require('./routes/category')

// Use Routes
app.use('/api/v1/offer', offerRoutes)
app.use('/api/v1/offers/with-count', offersRoutes)
app.use('/api/v1/user/', userRoutes)
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
