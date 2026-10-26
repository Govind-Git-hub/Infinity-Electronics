const cloudinary = require('../config/cloudinary');
const stream = require('stream');

const uploadToCloudinary = (buffer, folder = 'products') => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                if (!result?.secure_url) {
                    return reject(new Error('Cloudinary image URL not found'));
                }

                resolve(result.secure_url);
            }
        );

        const bufferStream = new stream.PassThrough();

        bufferStream.end(buffer);
        bufferStream.pipe(uploadStream);
    });
};

module.exports = uploadToCloudinary;