const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gostmood/images',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 800, height: 600, crop: 'limit', quality: 'auto' }],
  },
});

const audioStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'gostmood/audio',
    resource_type: 'video',
    allowed_formats: ['mp3', 'wav', 'aiff', 'flac', 'ogg', 'm4a', 'aac'],
  },
});

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Format image invalide. Utilisez jpg, png ou webp.'));
};

const audioFilter = (req, file, cb) => {
  const allowed = /mp3|wav|aiff|flac|ogg|m4a|aac/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
  else cb(new Error('Format audio invalide. Utilisez mp3, wav ou flac.'));
};

exports.uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

exports.uploadAudio = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: { fileSize: 150 * 1024 * 1024 },
});
