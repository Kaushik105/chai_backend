import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
	try {
		if (!localFilePath) return null;
		//upload the file on cloudinary
		const response = await cloudinary.uploader.upload(localFilePath, {
			resource_type: "auto",
		});

		// Remove the local when file upload has been successful
		fs.unlinkSync(localFilePath);
		
		return response;
		// console.log("file uploaded successfully")
		// return true;
	} catch (error) {
		//remove the locally saved temp file as the upload get failed for security purposes
		fs.unlinkSync(localFilePath);
		return null;
	}
};

const deleteOnCloudinary = async (cloudImgURL, type) => {
	cloudImgURL = cloudImgURL.split("/").slice(-1)[0].split(".")[0];
	try {
		if (!cloudImgURL) return;
		const response = await cloudinary.uploader.destroy(cloudImgURL, {
			resource_type: type,
		});
		return response;
	} catch (error) {
		console.log(error);
		
		throw new ApiError(500, "previous file deletion failed");
	}
};

export { uploadOnCloudinary, deleteOnCloudinary };
