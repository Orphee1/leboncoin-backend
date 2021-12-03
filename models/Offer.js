const mongoose = require('mongoose')

const OfferSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A title must be provided'],
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: [true, 'A price must be provided'],
  },
  pictures: {
    type: String,
    default: '',
  },
  category: {
    type: String,
    enum: [
      'Voitures',
      'Motos',
      'Caravaning',
      'Utilitaires',
      'Informatique',
      'Consoles & Jeux vidéo',
      'Image & Son',
      'Téléphonie',
      'Ameublement',
      'Electroménager',
      'Arts de la table',
      'Articles de sport',
      'Décoration',
      'Linge de maison',
      'Bricolage',
      'Jardinage',
      'Vêtements',
    ],
  },
  // category: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Category',
  // },
  location: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
})

module.exports = mongoose.model('Offer', OfferSchema)
