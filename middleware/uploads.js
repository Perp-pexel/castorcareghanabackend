import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../utils/cloudinary.js';

// Advert image upload
export const productImageUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'castorcareghana/product', // No need for * wildcard
      // allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'ico', 'svg'],

    },
  }),
});

// User avatar upload
export const userAvatarUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'castorcareghana/users',
      // allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'ico', 'svg'],
    },
  }),
});

export const educationMediaUpload = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'castorcareghana/education',
      resource_type: 'auto',
      // allowed_formats removed to accept all formats
    }
  })
});
