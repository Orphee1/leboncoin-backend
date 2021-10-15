// Models import
const Category = require('../models/Category')
const Offer = require('../models/Offer')
const User = require('../models/User')

const getAllOffers = async (req, res) => {
  console.log('Route offers OK')

  try {
    let offers
    let skip = req.fields.skip
    let limit = req.fields.limit
    let limitOk = Number(skip) + Number(limit)

    if (req.fields) {
      // filter creation
      const filters = {}
      if (req.fields.title) {
        filters.title = new RegExp(req.fields.title, 'i')
      }

      if (req.fields.category && req.fields.category !== 'Catégories') {
        // Get category's id
        let category = await Category.findOne({
          title: req.fields.category,
        })
        filters.category = category._id
      }
      if (req.fields.priceMin) {
        filters.price = {}
        filters.price.$gte = req.fields.priceMin
      }
      if (req.fields.priceMax) {
        if (req.fields.priceMax !== '----') {
          if (filters.price === undefined) {
            filters.price = {}
          }

          filters.price.$lte = req.fields.priceMax
        }
      }
      // console.log(filters)

      // this populate allows front-end to get category.title
      offers = await Offer.find(filters).populate('category')

      if (req.fields.sort) {
        if (req.fields.sort === 'price-asc') {
          offers.sort(function (a, b) {
            return a.price - b.price
          })
        }
        if (req.fields.sort === 'price-desc') {
          offers.sort(function (a, b) {
            return b.price - a.price
          })
        }
        if (req.fields.sort === 'date-desc') {
          console.log('Here we are')
          offers.sort(function (a, b) {
            var aa = a.created.split('/').reverse().join(),
              bb = b.created.split('/').reverse().join()
            console.log(aa)
            // console.log(bb);
            return bb < aa ? -1 : bb > aa ? 1 : 0
          })
        }

        if (req.fields.sort === 'date-asc') {
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
    // console.log(skip)
    // console.log(limitOk)

    // console.log(response);
    await res.json(response)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getOffer = async (req, res) => {
  console.log('route Offer OK')

  try {
    const id = req.query.id
    console.log(id)
    const offerToFind = await Offer.findById(id)

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

    if (offerToFind) {
      res.status(200).json([offerToFind, announcesNumber, tokenToSend])
    } else {
      console.log('here we are')
      res.status(404).json({ message: 'Product not found' })
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

const createOffer = async (req, res) => {
  console.log('route publish OK')

  try {
    const parts = req.headers.authorization.split(' ')
    const token = parts[1]
    const user = await User.findOne({ token })
    // console.log(user.username)
    const { title, description, price, location } = req.fields
    const category = await Category.findOne({
      title: req.fields.category,
    })
    // console.log(category)
    const offer = new Offer({
      title,
      description,
      price,
      category,
      location,
      /* pictures: req.pictures */
    })
    offer.pictures = req.pictures
    // console.log(offer)
    // const date = new Date().toDateString();
    const date = new Date()
    let year = date.getFullYear()
    let month = date.getMonth() + 1
    let day = date.getDate()
    let hour = date.getHours()
    let min = date.getMinutes()

    if (day < 10) {
      day = `0${day.toString()}`
    }

    if (month < 10) {
      month = `0${month.toString()}`
    }

    if (hour < 10) {
      hour = `0${hour.toString()}`
    }

    if (min < 10) {
      min = `0${min.toString()}`
    }

    let dateDisplay = ''
    dateDisplay += day + '/' + month + '/' + year + ' à ' + hour + ':' + min

    offer.created = dateDisplay
    offer.creator = user.username

    await offer.save()
    res.json({ message: 'Offer is published' })
  } catch (e) {
    res.status(500).json({ message: 'An error occurred' })
  }
}

const deleteOffer = async (req, res) => {
  console.log('route offer delete OK')
  try {
    const { id: offerId } = req.params
    let offer = await Offer.findOneAndDelete({ _id: offerId })
    if (!offer) {
      return res
        .status(404)
        .json({ msg: `No task found with id n° ${offerId}` })
    }
    res.status(200).json({
      message: 'The following offer has been deleted',
      offer,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

const updateOffer = async (req, res) => {
  console.log('route offer update OK')

  try {
    let { id: offerId } = req.params
    console.log(offerId)
    // const category = await Category.findOne({
    //   title: req.fields.category,
    // })

    // console.log(category)

    const offer = await Offer.findOneAndUpdate({ _id: offerId }, req.fields, {
      new: true,
      runValidators: true,
    })
    if (!offer) {
      return res
        .status(404)
        .json({ msg: `No task found with id n° ${offerId}` })
    }
    res.status(200).json({ offer })

    // if (category) {
    //   offerToUpdate.category = category
    // }
    // await offerToUpdate.save()
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

module.exports = {
  createOffer,
  deleteOffer,
  getAllOffers,
  getOffer,
  updateOffer,
}
