import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Upload options
 * @param {string} options.folder - Cloudinary folder
 * @param {string} options.resourceType - 'image', 'raw', or 'auto'
 * @param {string} options.publicId - Optional custom public ID
 * @returns {Promise<{url: string, publicId: string, format: string, bytes: number}>}
 */
export async function uploadToCloudinary(buffer, options = {}) {
  const { folder = 'simkantor', resourceType = 'auto', publicId } = options;

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        ...(publicId && { public_id: publicId }),
      },
      (error, result) => {
        if (error) reject(error);
        else
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            bytes: result.bytes,
          });
      },
    );

    // Write buffer to the upload stream
    const Readable = require('stream').Readable;
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

/**
 * Delete a file from Cloudinary
 * @param {string} publicId - The public ID of the file
 * @param {string} resourceType - 'image', 'raw', or 'video'
 */
export async function deleteFromCloudinary(publicId, resourceType = 'raw') {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });
}

export default cloudinary;
