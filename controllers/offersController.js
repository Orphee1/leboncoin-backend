const { StatusCodes } = require('http-status-codes')
const Category = require('../models/Category')
const Offer = require('../models/Offer')
const User = require('../models/User')

const { createCustomError } = require('../errors/custom-error')
const { NotFoundError } = require('../errors')
const asyncWrapper = require('../middlewares/async')

const getAllOffers = asyncWrapper(async (req, res) => {
  console.log(req.query)

  const { skip, limit, sort, category, priceMax, priceMin, title } = req.query
  const limitOk = Number(skip) + Number(limit)
  console.log(limitOk)
  const queryObject = {}
  if (title) {
    queryObject.title = new RegExp(title, 'i')
  }
  if (category) {
    queryObject.category = category
  }
  if (priceMin) {
    queryObject.price = {}
    queryObject.price.$gte = priceMin
  }
  if (priceMax) {
    queryObject.price = {}
    queryObject.price.$lte = priceMax
  }
  // console.log(queryObject)

  let result = Offer.find(queryObject)

  if (sort) {
    let sortedBy
    if (sort === 'price-asc') {
      sortedBy = 'price'
    }
    if (sort === 'price-desc') {
      console.log('here we are')
      sortedBy = '-price'
    }
    if (sort === 'date-asc') {
      sortedBy = { createdAt: 1 }
    }
    if (sort === 'date-desc') {
      sortedBy = { createdAt: -1 }
    }
    result = result.sort(sortedBy)
  }

  const offers = await result

  res.status(200).json({
    count: offers.length,
    offers: offers.slice(Number(skip), limitOk),
  })
})

const getOffer = asyncWrapper(async (req, res, next) => {
  console.log('offer route hit')
  const { id: offerId } = req.params
  console.log(offerId)
  // const offerTo{offerFind = await Offer.findById(offerId})
  const offer = await Offer.findOne({ _id: offerId })
  if (!offer) {
    throw new NotFoundError(`Sorry, no offer found with this id: ${offerId}`)
  }
  //{offer let user = offer.creator
  // // get all announces from the creator
  // const query = Offer.find({ creator: user }) //
  // query.getFilter()
  // const offersFromCreator = await query.exec()
  // const announcesNumber = offersFromCreator.length
  // console.log(announcesNumber)

  // // get creator's token
  // const userToFind = await User.findOne({ username: user })
  // const tokenToSend = userToFind.token

  let announcesNumber = 6

  res.status(StatusCodes.OK).json({ offer, announcesNumber })
  // res.status(StatusCodes.OK).json({ offer })
  // res.status(200).json([offer, announcesNumber, tokenToSend])
})

const createOffer = asyncWrapper(async (req, res) => {
  const pictures = req.pictures
  const { title, description, price, location, category } = req.fields
  const offer = await Offer.create({
    title,
    description,
    price,
    location,
    category,
    pictures,
  })
  res.status(StatusCodes.CREATED).json({ offer })
})

const deleteOffer = asyncWrapper(async (req, res, next) => {
  console.log('route offer delete OK')

  const { id: offerId } = req.params
  let offer = await Offer.findOneAndDelete({ _id: offerId })
  if (!offer) {
    return next(createCustomError(`No item found with id n° ${offerId}`, 404))
  }
  res.status(200).json({
    message: 'The following offer has been deleted',
    offer,
  })
})

const updateOffer = asyncWrapper(async (req, res, next) => {
  console.log('route offer update OK')

  let { id: offerId } = req.params
  console.log(offerId)
  // const category = await Category.findOne({
  //   title: req.fields.category,
  // })

  // console.log(category)

  const offer = await Offer.findOneAndUpdate(
    { _id: offerId },
    // req.fields,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )
  if (!offer) {
    return next(createCustomError(`No item found with id n° ${offerId}`, 404))
  }
  res.status(200).json({ offer })

  // if (category) {
  //   offerToUpdate.category = category
  // }
  // await offerToUpdate.save()
})
module.exports = {
  createOffer,
  deleteOffer,
  getAllOffers,
  getOffer,
  updateOffer,
}
