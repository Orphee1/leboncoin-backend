const cloudinary = require('cloudinary').v2
const { StatusCodes } = require('http-status-codes')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadPicture = async (req, res, next) => {
  try {
    const path = req.files.pictures.path
    const result = await cloudinary.uploader.upload(path, {
      use_filename: true,
      folder: 'LE_BON_COIN',
    })
    req.pictures = await result.secure_url
    next()
  } catch (e) {
    console.log(e)
    res.status(StatusCodes.BAD_REQUEST).json({
      message: 'An error occurred uploading picture',
    })
  }
}

module.exports = uploadPicture
