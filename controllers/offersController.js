const { StatusCodes } = require('http-status-codes')
const Category = require('../models/Category')
const Offer = require('../models/Offer')
const User = require('../models/User')

const { createCustomError } = require('../errors/custom-error')
const asyncWrapper = require('../middlewares/async')

const getAllOffers = asyncWrapper(async (req, res) => {
  console.log('Route offers OK')

  let offers
  const { skip, limit, sort, category, priceMax, priceMin, title } = req.body
  console.log(req.body)
  let limitOk = Number(skip) + Number(limit)

  if (req.body) {
    const filters = {}
    if (req.body.title) {
      filters.title = new RegExp(req.body.title, 'i')
    }

    if (req.body.category && req.body.category !== 'Catégories') {
      // Get category's id
      let category = await Category.findOne({
        title: req.body.category,
      })
      filters.category = category._id
    }
    if (req.body.priceMin) {
      filters.price = {}
      filters.price.$gte = req.body.priceMin
    }
    if (req.body.priceMax) {
      if (req.body.priceMax !== '----') {
        if (filters.price === undefined) {
          filters.price = {}
        }

        filters.price.$lte = req.body.priceMax
      }
    }
    // console.log(filters)

    // this populate allows front-end to get category.title
    // offers = await Offer.find(filters).populate('category')
    offers = await Offer.find()
    console.log(offers)

    if (req.body.sort) {
      if (req.body.sort === 'price-asc') {
        offers.sort(function (a, b) {
          return a.price - b.price
        })
      }
      if (req.body.sort === 'price-desc') {
        offers.sort(function (a, b) {
          return b.price - a.price
        })
      }
      if (req.body.sort === 'date-desc') {
        console.log('Here we are')
        offers.sort(function (a, b) {
          var aa = a.created.split('/').reverse().join(),
            bb = b.created.split('/').reverse().join()
          console.log(aa)
          // console.log(bb);
          return bb < aa ? -1 : bb > aa ? 1 : 0
        })
      }

      if (req.body.sort === 'date-asc') {
        console.log('So here we are')
        offers.sort(function (a, b) {
          var aa = a.created.split('/').reverse().join(),
            bb = b.created.split('/').reverse().join()
          console.log(a.created)
          console.log('an other fire')
          // console.log(bb);
          return aa < bb ? -1 : aa > bb ? 1 : 0
        })
      }
    }
  } else {
    console.log('Then here we are')
    // this populate allows front-end to get category.title
    offers = await Offer.find().populate('category')
  }

  let response = {
    count: offers.length,
    offers: offers.slice(skip, limitOk),
  }

  await res.json(response)
})

const getOffer = asyncWrapper(async (req, res, next) => {
  console.log('route Offer OK')

  const { id: offerId } = req.params
  console.log(offerId)
  // const offerToFind = await Offer.findById(offerId)
  const offerToFind = await Offer.findOne({ _id: offerId })
  if (!offerToFind) {
    return next(createCustomError(`No item found with id n° ${offerId}`, 404))
  }
  let user = offerToFind.creator
  // get all announces from the creator
  const query = Offer.find({ creator: user }) //
  query.getFilter()
  const offersFromCreator = await query.exec()
  const announcesNumber = offersFromCreator.length
  console.log(announcesNumber)

  // get creator's token
  const userToFind = await User.findOne({ username: user })
  const tokenToSend = userToFind.token

  res.status(200).json([offerToFind, announcesNumber, tokenToSend])
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
