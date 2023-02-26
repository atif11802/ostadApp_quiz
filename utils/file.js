const cloudinary = require("cloudinary").v2;

/**
 * Check file is an image or not
 *
 * @param {File} file File object
 */
module.exports.isImage = (file) => {
	return file.type.startsWith("image/");
};

/**
 * Upload a file
 *
 * @param {string} filePath Path of the file
 * @returns promise
 */
module.exports.upload = async (filePath) => {
	return await cloudinary.uploader.upload(filePath);
};
