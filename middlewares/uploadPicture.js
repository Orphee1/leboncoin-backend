const cloudinary = require("cloudinary").v2;

// Configuration de Cloudinary
cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
});

// const uploadPicture = (req, res, next) => {
module.exports = (req, res, next) => {
      try {
            if (Object.keys(req.files).length) {
                  cloudinary.uploader.upload(
                        req.files.pictures.path, 
                        async (error, result) => {
                              if (error) {
                                    return res.json({ error: "Upload Error" });
                              } else {
                                    req.pictures = await result.secure_url; 
                                    next();
                              }
                        }
                  );
            } else {
                  req.pictures = "";
                  next();
            }
      } catch (e) {
            console.log(e);
            res.status(400).json({
                  message: "An error occurred uploading picture"
            });
      }
};
