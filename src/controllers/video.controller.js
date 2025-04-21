import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
	const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
	//TODO: get all videos based on query, sort, pagination

	const options = {
		page,
		limit,
		sort: [sortBy, sortType],
	};

	const video = await Video.aggregate();
});

const publishAVideo = asyncHandler(async (req, res) => {
	const { title, description } = req.body;
	const user = req.user;

	// Getting the videos
	const localVideo = req?.files?.newVideo?.[0]?.path;
	const localThumb = req?.files?.newThumb?.[0]?.path;
	// TODO: get video, upload to cloudinary, create video

	if (!(title || description)) {
		return res.json(new ApiError(400, "title and description is required"));
	}

	// Uploading on cloudinary
	const videoFile = await uploadOnCloudinary(localVideo);
	const thumbFile = await uploadOnCloudinary(localThumb);

	const video = await Video.create({
		videoFile: videoFile.url,
		owner: user._id.toHexString(),
		thumbnail: thumbFile.url,
		title,
		description,
		duration: videoFile.duration,
		views: 0,
		isPublished: true,
	});

	if (!video) {
		throw new ApiError(500, "video upload failed")
	}

	return res
		.status(200)
		.json(new ApiResponse(200, video, "video uploaded successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
	const { videoId } = req.params;
	//TODO: get video by id

	if (!videoId) {
		throw new ApiError(400, "can't get the video id");
	}

	const video = await Video.aggregate([
		{
			$match: {
				$and: [
					{ _id: new mongoose.Types.ObjectId(videoId) },
					{ isPublished: true },
				],
			},
		},
		{
			$lookup: {
				from: "users",
				localField: "_id",
				foreignField: "watchHistory",
				as: "viewers",
			},
		},
		{
			$set: {
				views: { $size: "$viewers" },
			},
		},
		{
			$project: {
				videoFile: 1,
				title: 1,
				thumbnail: 1,
				owner: 1,
				description: 1,
				duration: 1,
				views: 1,
			},
		},
	]);

	if (!video[0]) {
		throw new ApiError(500, "cannot get the video");
	}

	return res
		.status(200)
		.json(new ApiResponse(201, video[0], "video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
	const { videoId } = req?.params;
	const { newTitle, newDescription } = req.body;
	const newThumb = req?.file?.path;

	//TODO: update video details like title, description, thumbnail

	if (!videoId) {
		throw new ApiError(400, "can't get the video id");
	}
	// check if all the parameters are present
	if (!(newTitle || newDescription || newThumb)) {
		throw new ApiError(400, "invalid update parameters");
	}
	if (!newThumb) {
		throw new ApiError(400, "no new thumbnail");
	}
	const prevThumbnail = await Video.findById(videoId);
	if (!prevThumbnail) {
		throw new ApiError(500, "can't get video by id");
	}

	//uploading the new thumbnail on cloudinary
	const thumbnail = await uploadOnCloudinary(newThumb);

	//deleting the previous thumbnail from server
	const deletePrevThumb = await deleteOnCloudinary(
		prevThumbnail.thumbnail,
		"image"
	);

	// get the video

	const video = await Video.findByIdAndUpdate(
		videoId,
		{
			title: newTitle,
			description: newDescription,
			thumbnail: thumbnail.url,
		},
		{
			new: true,
		}
	);

	if (!video) {
		throw new ApiError(500, "can't update the video");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, video, "video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
	const { videoId } = req.params;

	if (!videoId) {
		throw new ApiError(400, "can't get videoId");
	}
	//TODO: delete video

	const video = await Video.findByIdAndDelete(videoId);

	if (!video) {
		throw new ApiError(500, "video deletion failed")
	}

	// Delete the video files and the thumbnail on cloudinary
	const dltVideo = await deleteOnCloudinary(video.videoFile, "video");
	const dltThumb = await deleteOnCloudinary(video.thumbnail, "image");

	if (!(dltVideo && dltThumb)) {
		throw new ApiError(500, "video file or thumbnail deletion failed");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, video, "video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
	const { videoId } = req.params;

	if (!videoId) {
		throw new ApiError(400, "can't get the video id");
	}

	const currentVideo = await Video.findById(videoId);
	if (!currentVideo) {
		throw new ApiError(500, "video not found");
	}

	const video = await Video.findByIdAndUpdate(
		videoId,
		{
			$set: {
				isPublished: !currentVideo.isPublished,
			},
		},
		{
			new: true,
		}
	);

	if (!video) {
		throw new ApiError(500, "publish toggle failed");
	}

	return res
		.status(200)
		.json(new ApiResponse(200, video, "publish status changed"));
});

export {
	getAllVideos,
	publishAVideo,
	getVideoById,
	updateVideo,
	deleteVideo,
	togglePublishStatus,
};
