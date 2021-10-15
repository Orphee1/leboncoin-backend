require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()
const formidableMiddleware = require('express-formidable')

app.use(cors())
app.use(formidableMiddleware())

const connectDB = require('./db/connect')

// Loading Routes
const offerRoutes = require('./routes/offer')
const offersRoutes = require('./routes/offers')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')

// Use Routes
app.use('/api/v1/offer', offerRoutes)
app.use('/api/v1/offers/with-count', offersRoutes)
app.use(userRoutes)
app.use(categoryRoutes)

// Test Route
app.get('/', async (req, res) => {
  try {
    res.json({ message: 'hello Leboncoin' })
  } catch (error) {
    console.log(error.message)
    res.status(400).json(error.message)
  }
})

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
