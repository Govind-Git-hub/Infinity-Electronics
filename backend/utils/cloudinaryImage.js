const cloudinary = require('../config/cloudinary');
const uploadToCloudinary = require('./uploadToCloudinary');

const createCloudinaryImage = async (fileBuffer, folder) => {
    if (!fileBuffer) {
        throw new Error('Image file is required');
    }

    if (!folder) {
        throw new Error('Cloudinary folder is required');
    }

    return await uploadToCloudinary(fileBuffer, folder);
};

const getCloudinaryPublicId = (imageUrl) => {
    try {
        if (typeof imageUrl !== 'string' || !imageUrl.startsWith('https://')) {
            return null;
        }

        const url = new URL(imageUrl);

        if (url.hostname !== 'res.cloudinary.com') {
            return null;
        }

        const segments = url.pathname.split('/').filter(Boolean);
        const uploadIndex = segments.indexOf('upload');

        if (uploadIndex === -1) {
            return null;
        }

        let publicIdSegments = segments.slice(uploadIndex + 1);

        // Remove the version segment, for example v1750000000.
        if (publicIdSegments[0]?.match(/^v\d+$/)) {
            publicIdSegments = publicIdSegments.slice(1);
        }

        if (!publicIdSegments.length) {
            return null;
        }

        const lastSegmentIndex = publicIdSegments.length - 1;

        // Remove the file extension from the final segment.
        publicIdSegments[lastSegmentIndex] =
            publicIdSegments[lastSegmentIndex].replace(/\.[^/.]+$/, '');

        const publicId = publicIdSegments.join('/');

        return publicId || null;
    } catch (error) {
        return null;
    }
};

const deleteCloudinaryImage = async (imageUrl) => {
    const publicId = getCloudinaryPublicId(imageUrl);

    if (!publicId) {
        console.warn('Invalid Cloudinary image URL; deletion skipped:', imageUrl);
        return false;
    }

    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
        invalidate: true
    });

    if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error(`Cloudinary deletion was not confirmed: ${publicId}`);
    }

    return true;
};

module.exports = {
    createCloudinaryImage,
    getCloudinaryPublicId,
    deleteCloudinaryImage
};